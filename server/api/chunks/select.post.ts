import { cosineDistance, desc, getTableColumns, sql } from 'drizzle-orm'
import { z } from 'zod'
import { embed } from '~~/server/ai/llm'
import { JobChunksTable } from '~~/server/db/schema/job_chunks'
import { db } from '~~/server/utils/drizzle'

type Chunk = Omit<(typeof JobChunksTable.$inferSelect) & { score: number }, 'embedding'>

const TOP_CHUNKS_PER_QUERY = 500
const SEMANTIC_RATIO = 0.5

export default defineEventHandler(async (event) => {
  const { query } = await readValidatedBody(
    event,
    z.object({ query: z.string().nonempty().trim() }).parse,
  )

  const [semanticChunks, lexicalChunks] = await Promise.all([
    getSemanticChunks(query),
    getLexicalChunks(query),
  ])

  const entries = new Map<
  string,
{
  jobId: string
  semanticScore: number
  lexicalScore: number
  chunks: Map<string, Chunk>
}
>()
  for (const chunk of semanticChunks) {
    const entry = entries.get(chunk.jobId) ?? {
      jobId: chunk.jobId,
      chunks: new Map(),
      semanticScore: 0,
      lexicalScore: 0,
    }

    entry.chunks.set(chunk.id, chunk)
    entry.semanticScore = Math.max(entry.semanticScore, chunk.score)
    entries.set(chunk.jobId, entry)
  }

  for (const chunk of lexicalChunks) {
    const entry = entries.get(chunk.jobId) ?? {
      jobId: chunk.jobId,
      chunks: new Map(),
      semanticScore: 0,
      lexicalScore: 0,
    }

    entry.chunks.set(chunk.id, chunk)
    entry.lexicalScore = Math.max(entry.lexicalScore, chunk.score)
    entries.set(chunk.jobId, entry)
  }

  const jobs = Array.from(entries.values())
  const semanticScores = jobs.map(j => j.semanticScore)
  const lexicalScores = jobs.map(j => j.lexicalScore)

  const normSemantic = normalize(semanticScores)
  const normLexical = normalize(lexicalScores)

  const result = jobs.map((job, i) => {
    const semantic = normSemantic[i]
    const lexical = normLexical[i]
    const score = SEMANTIC_RATIO * semantic + (1 - SEMANTIC_RATIO) * lexical

    const chunks = Array.from(job.chunks.values())
      .filter(c => c.score > 1)
      .sort((a, b) => b.score - a.score)

    return {
      jobId: job.jobId,
      score,
      chunks,
    }
  })

  return result.sort((a, b) => b.score - a.score)
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

  return chunks
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

  return chunks
}

// TODO: Rank normalization
function normalize(scores: number[]) {
  const sorted = scores.map((s, i) => ({ s, i })).sort((a, b) => a.s - b.s)
  const ranks: number[] = Array.from({ length: scores.length })
  let i = 0
  while (i < sorted.length) {
    let j = i
    while (j < sorted.length && sorted[j].s === sorted[i].s)
      j++

    const avg = (i + j - 1) / 2
    for (let k = i; k < j; k++) {
      ranks[sorted[k].i] = avg
    }
    i = j
  }
  const n = scores.length - 1
  return ranks.map(r => (n === 0 ? 1 : r / n))
}
