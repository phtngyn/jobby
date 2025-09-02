/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Filters, Job } from '~~/shared/types'
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
    get_filters: get_filters(writer),
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
      const filters = await extractFilters(
        messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-5),
      )

      const filteredJobs = await $fetch('/api/jobs/select', {
        method: 'POST',
        body: { filters },
      })

      console.dir({
        filters,
        length: filteredJobs.length,
      }, { depth: null })

      const chunks = await $fetch('/api/chunks/select', {
        method: 'POST',
        body: {
          query,
          job_ids: filteredJobs.map(x => x.id),
        },
      })

      const map = new Map(chunks.map(c => [c.job_id, c]))

      const job_ids = chunks.map(c => c.job_id)
      const jobs = await $fetch('/api/jobs/select', {
        method: 'POST',
        body: { job_ids },
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
          const chunk = map.get(j.id) ?? { id: j.id, score: 0, chunks: [] }
          const score = Math.round(chunk.score * 100)

          return { ...job, ...chunk, score }
        })
        .sort((a, b) => b.score - a.score)

      return results
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

function get_filters(writer: ChatWriter) {
  return (_filters: Filters) => tool({
    description: '',
    name: '',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.object(),
    async execute({ prompt }, { toolCallId: id }) {
      return {}
    },
  })
}
