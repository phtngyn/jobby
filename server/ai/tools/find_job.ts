import type { Job } from '#shared/types'
import { JobSchema } from '#shared/schemas'
import { generateText, tool } from 'ai'
import { z } from 'zod'
import { LIGHT_MODEL } from '~~/shared/constants'
import { provider } from '../llm'
import { stringify } from '../utils'

const JobWithScoreSchema = z.object({
  job: JobSchema,
  score: z.number().describe('Semantic similarity score (0-1)'),
})

export const FindJobOutputSchema = z.object({
  results: JobWithScoreSchema.array(),
  summary: z.string().describe('Natural language summary of the search results'),
  count: z.number().describe('Total number of matching jobs found'),
})

export const find_job = tool({
  description: 'Retrieves job postings using semantic search and provides a summary of results.',
  inputSchema: z.object({
    input: z.string().describe('Free-text query describing the desired job.'),
    limit: z.number().min(1).max(10).default(5).describe('Maximum number of jobs to return'),
    minScore: z.number().min(0).max(1).default(0.5).describe('Minimum similarity score threshold'),
  }),
  outputSchema: FindJobOutputSchema,
  async execute({ input, limit, minScore }) {
    const sanitized = input.trim()
    if (!sanitized) {
      return { results: [], summary: 'No search query provided.', count: 0 }
    }

    try {
      const { ids, scores } = await $fetch('/api/similarity', {
        method: 'POST',
        body: { input: sanitized, minScore, limit },
      })

      if (!ids.length) {
        return {
          results: [],
          summary: `No jobs matching "${sanitized}" were found. Try broadening your search or using different keywords.`,
          count: 0,
        }
      }

      const jobs = await $fetch('/api/jobs', {
        method: 'POST',
        body: { ids },
      })

      const results = jobs
        .map(job => ({ job, score: scores[job.id] || 0 }))
        .filter(({ score }) => score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      if (results.length === 0) {
        return {
          results: [],
          summary: `Found some jobs for "${sanitized}", but none met the minimum relevance threshold of ${minScore}. Try lowering the threshold or using different search terms.`,
          count: 0,
        }
      }

      const summary = await generateSummary(results, sanitized)

      return {
        results,
        summary,
        count: results.length,
      }
    }
    catch (error) {
      console.error('find_job error:', error)
      return {
        results: [],
        summary: 'An error occurred while searching for jobs. Please try again later.',
        count: 0,
      }
    }
  },
})

async function generateSummary(results: { job: Job, score: number }[], query: any) {
  if (results.length === 0) {
    return `No jobs matching "${query}" were found.`
  }

  const jobs = results.map((r, i) => {
    return `Job ${i + 1}:\n${stringify(r.job)}\nScore: ${r.score}`
  }).join('\n\n')

  const response = await generateText({
    model: provider(LIGHT_MODEL),
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `I need a user-friendly summary of job search results for "${query}".

Here are the top ${results.length} jobs (already ranked by relevance):
${jobs}

Write 2-3 sentences that:
1. Mention how many jobs were found and what they generally are
2. Highlight common patterns (job types, locations, work arrangements)
3. Briefly mention the top opportunity (the #1 ranked job)

Use natural, conversational language as if speaking directly to a job seeker. 
Don't mention scores or technical details. Focus on practical information.`,
        },
      ],
    }],
  })

  return response.text.trim()
}
