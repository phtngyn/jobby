import { cosineDistance, desc, getTableColumns, sql } from 'drizzle-orm'
import { z } from 'zod'
import { embed } from '~~/server/ai/llm'
import { JobChunksTable } from '~~/server/db/schema/job_chunks'
import { db } from '~~/server/utils/drizzle'

type Chunk = Omit<(typeof JobChunksTable.$inferSelect) & { score: number }, 'embedding'>

const TOP_CHUNKS_PER_QUERY = 200
const TOP_CHUNKS_PER_JOBS = 10

export default defineEventHandler(async (event) => {
  const { query } = await readValidatedBody(
    event,
    z.object({ query: z.string().nonempty().trim() }).parse,
  )

  const [semanticChunks, lexicalChunks] = await Promise.all([
    getSemanticChunks(query),
    getLexicalChunks(query),
  ])

  const entries = new Map<string, { jobId: string, chunks: Chunk[] }>()
  for (const chunk of semanticChunks.concat(lexicalChunks)) {
    const entry = entries.get(chunk.jobId)

    if (entry) {
      const idx = entry.chunks.findIndex(c => c.id === chunk.id)
      if (idx === -1) {
        entry.chunks.push(chunk)
      }
      else {
        entry.chunks[idx].score += chunk.score
      }
    }
    else {
      const entry = {
        jobId: chunk.jobId,
        score: chunk.score,
        chunks: [chunk],
      }
      entries.set(chunk.jobId, entry)
    }
  }

  const array = Array.from(entries.values()).map((entry) => {
    const chunks = entry.chunks.sort((a, b) => b.score - a.score).slice(0, TOP_CHUNKS_PER_JOBS)
    const score = chunks.reduce((acc, c) => acc + c.score, 0)
    return {
      ...entry,
      score,
      chunks: normalize(chunks),
    }
  })

  return normalize(array)
})

async function getSemanticChunks(query: string) {
  const { embedding: _, ...rest } = getTableColumns(JobChunksTable)

  const embedding = await embed(query)
  const score = sql<number>`1 - (${cosineDistance(JobChunksTable.embedding, embedding)})`

  const chunks = await db
    .select({
      ...rest,
      score,
    })
    .from(JobChunksTable)
    .orderBy(desc(score))
    .limit(TOP_CHUNKS_PER_QUERY)

  return normalize(chunks)
}
async function getLexicalChunks(query: string) {
  const { embedding: _, ...rest } = getTableColumns(JobChunksTable)

  const score = sql<number>`paradedb.score(id)`.as('score')

  const chunks = await db
    .select({
      ...rest,
      score,
    })
    .from(JobChunksTable)
    .where(sql`${JobChunksTable.content} @@@ ${query}`)
    .orderBy(desc(score))
    .limit(TOP_CHUNKS_PER_QUERY)

  return normalize(chunks)
}

function normalize<T extends { score: number }>(array: T[]) {
  const scores = array.map(c => c.score)
  const min = Math.min(...scores)
  const max = Math.max(...scores)

  return array.map(c => ({
    ...c,
    score: max === min ? 1 : (c.score - min) / (max - min),
  }))
}
