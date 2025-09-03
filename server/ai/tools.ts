/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Job } from '~~/shared/types'
import { generateText, tool } from 'ai'
import { z } from 'zod'
import { LIGHT_MODEL } from '~~/shared/constants'
import { extractFilters } from '../utils/chat'
import { provider } from './llm'

export function getToolbox(writer: ChatWriter) {
  return {
    get_jobs: get_jobs(writer),
    get_similar_jobs: get_similar_jobs(writer),
    analyze_jobs: analyze_jobs(writer),
  }
}

function get_jobs(writer: ChatWriter) {
  return () => tool({
    description: 'Search for jobs based on user query',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Die Suchanfrage des Benutzers (muss auf Deutsch formuliert sein)'),
    }),
    async execute({ query }, { toolCallId, messages }) {
      const lastFiveMessages = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-5)

      const filters = await extractFilters({ messages: lastFiveMessages })

      const filteredJobs = await $fetch('/api/jobs', {
        method: 'POST',
        body: { filters },
      })

      const _items = await $fetch('/api/chunks', {
        method: 'POST',
        body: {
          query,
          job_ids: filteredJobs.map(x => x.id),
        },
      })

      const items = _items.sort((a, b) => b.score - a.score).slice(0, 10)
      const map = new Map(items.map(x => [x.job_id, x]))

      const jobs = await $fetch('/api/jobs', {
        method: 'POST',
        body: { job_ids: items.map(c => c.job_id) },
      })

      const results = jobs
        .map((j) => {
          const job = {
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            types: j.types,
            worktime_min: j.worktime_min,
            worktime_max: j.worktime_max,
            homeoffice: j.homeoffice,
          }
          const item = map.get(j.id) ?? { id: j.id, score: 0, chunks: [] }
          const score = Math.round(item.score * 100)
          return { ...job, ...item, score }
        })
        .sort((a, b) => b.score - a.score)

      const lastUserMessage = messages.findLast(m => m.role === 'user')

      const { text } = await generateText({
        model: provider(LIGHT_MODEL),
        system: `
You are a career assistant that recommends the most relevant jobs to the user.

Your task:
- Understand the user's intent from their query and last message.
- Rank jobs by relevance (semantic score + filter match).
- Focus on the top 3-5 jobs:
  - Give detailed recommendations with reasoning (why they fit the user's intent).
  - Mention role, company, location, work setup (homeoffice/onsite), contract type, and working time if available.
- For the remaining jobs:
  - Provide a short, high-level overview (e.g. "Other options include...").
- If no strong matches exist:
  - Politely explain this and suggest how the user could refine their query or filters.
- Always prioritize the query over old filters if there is a conflict.
- Suggest next steps (e.g. refine filters, broaden location, adjust contract type).
- Keep the tone professional, supportive, and user-friendly (like a career coach).
- Do not invent details that are not in the data.
- Output should be plain text, not JSON.
  `,
        prompt: `
Here are the job results (ranked by relevance):

${JSON.stringify(results, null, 2)}

User's last message:
"${lastUserMessage?.content ?? 'N/A'}"

Original query used for this search:
"${query ?? 'N/A'}"

Please provide a recommendation-style response:
- Highlight the top 3–5 jobs with detailed reasoning.
- Summarize the rest briefly.
- Suggest next steps if relevant.
  `,
      })

      return {
        jobs: results,
        summary: text,
      }
    },
  })
}

function get_similar_jobs(writer: ChatWriter) {
  return (payload: { jobs: Job[] }) => tool({
    description: 'Search for similar jobs in the database based on the user\'s uploaded jobs',
    inputSchema: z.object({
      query: z.string().describe('Optional extra query to refine the similarity search'),
    }),
    async execute({ query }, { toolCallId }) {
      console.log(payload.jobs)
      return []
    },

  })
}

function analyze_jobs(writer: ChatWriter) {
  return (payload: { jobs: Job[] }) =>
    tool({
      description:
        'Analyze the user\'s uploaded jobs (summarize, compare, filter, etc.)',
      inputSchema: z.object({
        query: z
          .string()
          .describe('The user\'s analysis request about the uploaded jobs'),
      }),
      async execute({ query }, { toolCallId }) {
        console.log({
          query,
          payload,
        })
        const { text } = await generateText({
          model: provider(LIGHT_MODEL),
          messages: [
            {
              role: 'system',
              content:
                'You are an assistant that analyzes uploaded jobs. '
                + 'You will receive a list of jobs in structured JSON and a user query. '
                + 'Provide a clear, helpful free-text answer based only on the uploaded jobs.',
            },
            {
              role: 'user',
              content: `User query: ${query}\n\nUploaded jobs:\n${JSON.stringify(payload.jobs, null, 2)}`,
            },
          ],
        })

        return text
      },
    })
}
