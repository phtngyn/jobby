/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Job, JobWithScore } from '~~/shared/types'
import { tool } from 'ai'
import { z } from 'zod'
import { JobWithScoreSchema } from '~~/shared/schemas'

interface Payload { jobs?: Job[] }

export function getJobs(writer: ChatWriter) {
  return (payload: Payload) => tool({
    description: 'Search for jobs based on user query',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ jobs: z.array(JobWithScoreSchema) }),
    async execute({ query }, { toolCallId }) {
      const chunks = await $fetch('/api/chunks/select', {
        method: 'POST',
        body: { input: query },
      })

      const chunkMap = new Map(chunks.map(c => [c.jobId, c.best]))

      const [jobsByIds, jobsBySearch] = await Promise.all([
        $fetch<JobWithScore[]>('/api/jobs/select', {
          method: 'POST',
          body: { jobIds: chunks.map(c => c.jobId) },
        }),
        $fetch<JobWithScore[]>('/api/jobs/select', {
          method: 'POST',
          body: { filters: { search: query } },
        }),
      ])

      const jobs = [
        ...jobsByIds.map(j => ({ ...j, score: chunkMap.get(j.jobId) ?? 0 })),
        ...jobsBySearch.map(j => ({ ...j, score: j.score ?? 0 })),
      ]

      const map = new Map<string, JobWithScore>()
      for (const job of jobs) {
        const j = map.get(job.jobId)

        if (j) {
          map.set(job.jobId, { ...j, score: j.score + job.score })
        }
        else {
          map.set(job.jobId, job)
        }
      }

      const merged = Array.from(map.values())
      if (!merged.length)
        return { jobs: [] }

      const max = Math.max(...merged.map(j => j.score))
      const threshold = max > 0.8 ? max * 0.7 : max * 0.5
      const results = merged
        .filter(j => j.score >= threshold)
        .map(j => ({ ...j, score: j.score / max }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)

      return { jobs: results }
    },
  })
}
