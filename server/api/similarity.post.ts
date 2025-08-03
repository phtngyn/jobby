import { z } from 'zod'
import { cosineDistance, db, desc, gt, sql } from '~~/db'
import { jobEmbeddings } from '~~/db/schema/jobs'
import { embed } from '../ai/llm'

export default defineEventHandler(async (event) => {
  const { input, minScore, limit } = await readValidatedBody(
    event,
    z.object({
      input: z.string(),
      minScore: z.number(),
      limit: z.number(),
    }).parse,
  )

  const embedding = await embed(input, 'RETRIEVAL_QUERY')

  const similarity = sql<number>`1 - (${cosineDistance(jobEmbeddings.embedding, embedding)})`
  const rows = await db
    .select({
      id: jobEmbeddings.jobId,
      similarity,
    })
    .from(jobEmbeddings)
    .where(gt(similarity, minScore))
    .orderBy(x => desc(x.similarity))
    .limit(limit)

  return {
    ids: rows.map(r => r.id),
    scores: Object.fromEntries(rows.map(r => [r.id, r.similarity])),
  }
})
