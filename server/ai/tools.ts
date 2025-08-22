/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Filters, Job } from '~~/shared/types'
import { tool } from 'ai'
import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { JobsTable } from '~~/server/db/schema/jobs'
import { db } from '~~/server/utils/drizzle'

export function getTools(writer: ChatWriter) {
  return {
    get_jobs: get_jobs(writer),
    get_filters: get_filters(writer),
  }
}

function get_jobs(writer: ChatWriter) {
  return (payload: { jobs?: Job[] }) => tool({
    description: 'Search for jobs based on user query',
    inputSchema: z.object({ query: z.string() }),
    async execute({ query }, { toolCallId }) {
      const chunks = await $fetch('/api/chunks/select', {
        method: 'POST',
        body: { query },
      })
      const map = new Map(chunks.map(c => [c.jobId, c]))

      const jobIds = chunks.map(c => c.jobId)
      const jobs = await db
        .select()
        .from(JobsTable)
        .where(inArray(JobsTable.jobId, jobIds))

      return jobs
        .map((j) => {
          const job = {
            jobId: j.jobId,
            angebotstitel: j.angebotstitel,
            firma: j.firma,
            arbeitsort: j.arbeitsort,
            jobtypen: j.jobtypen,
            arbeitszeitMin: j.arbeitszeitMin,
            arbeitszeitMax: j.arbeitszeitMax,
            homeoffice: j.homeoffice,
          }
          const chunk = map.get(j.jobId)

          return chunk
            ? { ...job, score: Math.round(chunk.score * 100), chunks: chunk.chunks }
            : { ...job, score: 0, chunks: [] }
        })
        .filter(j => j.score >= 25)
        .sort((a, b) => b.score - a.score)
    },
  })
}

export function get_filters(writer: ChatWriter) {
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
