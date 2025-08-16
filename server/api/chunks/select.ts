import { cosineDistance, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { embed } from '~~/server/ai/llm'
import { jobChunks } from '~~/server/db/schema/job_chunks'
import { jobs } from '~~/server/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'

export default defineEventHandler(async (event) => {
  const { input } = await readValidatedBody(
    event,
    z.object({ input: z.string().nonempty() }).parse,
  )

  const embedding = await embed(input)

  const similarity = sql<number>`1 - (${cosineDistance(jobChunks.embedding, embedding)})`
  const topChunks = 300
  const topChunksPerJob = 3
  const topResults = 100

  const chunks = await db
    .select({
      jobId: jobChunks.jobId,
      type: jobChunks.type,
      chunkIndex: jobChunks.chunkIndex,
      content: jobChunks.content,
      title: jobs.angebotstitel,
      similarity,
    })
    .from(jobChunks)
    .innerJoin(jobs, eq(jobChunks.jobId, jobs.jobId))
    .orderBy(t => desc(t.similarity))
    .limit(topChunks)

  const entries = new Map<
    string,
    {
      jobId: string
      title: string
      best: number
      chunks: typeof chunks
    }
  >()

  for (const c of chunks) {
    const entry = entries.get(c.jobId)

    if (entry) {
      if (c.similarity > entry.best) {
        entry.best = c.similarity
      }
      entry.chunks.push(c)
    }
    else {
      entries.set(c.jobId, {
        jobId: c.jobId,
        title: c.title,
        best: c.similarity,
        chunks: [c],
      })
    }
  }

  const results = Array.from(entries.values())
    .sort((a, b) => b.best - a.best)
    .slice(0, topResults)

  for (const result of results) {
    result.chunks = result.chunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topChunksPerJob)
  }

  return results
})
