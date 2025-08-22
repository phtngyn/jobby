import type { Job } from '~~/shared/types'
import sentencize from '@stdlib/nlp-sentencize'
import { z } from 'zod'
import { embedMany } from '~~/server/ai/llm'
import { JobChunksTable } from '~~/server/db/schema/job_chunks'
import { JobsTable } from '~~/server/db/schema/jobs'
import { db } from '~~/server/utils/drizzle'
import { JOB_SEARCH_TARGET_COLUMNS } from '~~/shared/constants'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { jobs: _jobs } = await readValidatedBody(
    event,
    z.object({ jobs: JobSchema.array() }).parse,
  )

  const parsed = _jobs.map(j => ({
    ...j,
    freigabedatum: new Date(j.freigabedatum),
  }))

  let created: Job[] | undefined
  await db.transaction(async (tx) => {
    created = await tx
      .insert(JobsTable)
      .values(parsed)
      .onConflictDoNothing({ target: JobsTable.jobId })
      .returning() as any

    if (!created)
      return

    const promises = created.map(async (job) => {
      for (const col of JOB_SEARCH_TARGET_COLUMNS) {
        const raw = job[col]
        if (!raw)
          continue

        const cleaning = clean(raw)
        if (!cleaning)
          continue

        const chunks = sentencize(cleaning)
        const embeddings = await embedMany(chunks)

        await tx.insert(JobChunksTable).values(
          chunks.map((c, i) => ({
            jobId: job.jobId,
            type: col,
            chunkIndex: i,
            content: c,
            embedding: embeddings[i],
          })),
        )
      }
    })

    await Promise.all(promises)
  })

  return created
})

function clean(html: string) {
  if (!html)
    return ''

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\?/g, ' ')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
