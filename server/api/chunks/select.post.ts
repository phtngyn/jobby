import { and, cosineDistance, desc, getTableColumns, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { embed } from '~~/server/ai/llm'
import { db, tables } from '~~/server/utils/drizzle'

type Chunk = Omit<(typeof tables.job_chunks.$inferSelect) & { score: number }, 'embedding'>

const TOP_CHUNKS_PER_QUERY = 500
const SEMANTIC_RATIO = 0.5

export default defineEventHandler(async (event) => {
  const { query, job_ids } = await readValidatedBody(
    event,
    z.object({
      query: z.string().trim().nonempty(),
      job_ids: z.array(z.string()).optional(),
    }).parse,
  )

  const [semanticChunks, lexicalChunks] = await Promise.all([
    getSemanticChunks({ prompt: query, job_ids }),
    getLexicalChunks({ prompt: query, job_ids }),
  ])

  const entries = new Map<
  string,
{
  job_id: string
  semanticScore: number
  lexicalScore: number
  chunks: Map<string, Chunk>
}
>()
  for (const chunk of semanticChunks) {
    const entry = entries.get(chunk.job_id) ?? {
      job_id: chunk.job_id,
      chunks: new Map(),
      semanticScore: 0,
      lexicalScore: 0,
    }

    entry.chunks.set(chunk.id, chunk)
    entry.semanticScore = Math.max(entry.semanticScore, chunk.score)
    entries.set(chunk.job_id, entry)
  }

  for (const chunk of lexicalChunks) {
    const entry = entries.get(chunk.job_id) ?? {
      job_id: chunk.job_id,
      chunks: new Map(),
      semanticScore: 0,
      lexicalScore: 0,
    }

    entry.chunks.set(chunk.id, chunk)
    entry.lexicalScore = Math.max(entry.lexicalScore, chunk.score)
    entries.set(chunk.job_id, entry)
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
      job_id: job.job_id,
      score,
      chunks,
    }
  })

  return result.sort((a, b) => b.score - a.score)
})

interface GetChunkPayload { prompt: string, job_ids?: string[] }

async function getSemanticChunks({ prompt, job_ids }: GetChunkPayload) {
  const { embedding: _, ...rest } = getTableColumns(tables.job_chunks)

  const embedding = await embed(prompt)
  const score = sql<number>`1 - (${cosineDistance(tables.job_chunks.embedding, embedding)})`

  const query = db
    .select({
      ...rest,
      score,
    })
    .from(tables.job_chunks)
    .where(job_ids?.length ? inArray(tables.job_chunks.job_id, job_ids) : sql`TRUE`)
    .orderBy(desc(score))
    .limit(TOP_CHUNKS_PER_QUERY)

  const chunks = await query

  return chunks
}

async function getLexicalChunks({ prompt, job_ids }: GetChunkPayload) {
  const { embedding: _, ...rest } = getTableColumns(tables.job_chunks)

  const score = sql<number>`paradedb.score(id)`.as('score')

  const query = db
    .select({
      ...rest,
      score,
    })
    .from(tables.job_chunks)
    .where(and(
      sql`${tables.job_chunks.content} @@@ ${prompt}`,
      job_ids?.length ? inArray(tables.job_chunks.job_id, job_ids) : sql`TRUE`,
    ))
    .orderBy(desc(score))
    .limit(TOP_CHUNKS_PER_QUERY)

  const chunks = await query

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
