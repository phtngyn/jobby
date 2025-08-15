import { cosineDistance, desc, eq, gt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { embed } from '~~/server/ai/llm'
import { jobChunks } from '~~/server/db/schema/job_chunks'
import { jobs } from '~~/server/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'

export default defineEventHandler(async (event) => {
  const { input } = await readValidatedBody(
    event,
    z.object({ input: z.string() }).parse,
  )

  const embedding = await embed(input)

  const similarity = sql<number>`1 - (${cosineDistance(jobChunks.embedding, embedding)})`
  const chunks = await db
    .selectDistinctOn([jobs.jobId], { title: jobs.angebotstitel, similarity })
    .from(jobChunks)
    .innerJoin(jobs, eq(jobChunks.jobId, jobs.jobId))
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(10)

  return chunks
})
