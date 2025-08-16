import type { Job } from '~~/shared/types'
import { z } from 'zod'
import { embedMany } from '~~/server/ai/llm'
import { jobChunks } from '~~/server/db/schema/job_chunks'
import { jobs } from '~~/server/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'
import { chunk, clean } from '~~/server/uitls/embed'
import { JOB_CHUNK_TYPES } from '~~/shared/constants'
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
      .insert(jobs)
      .values(parsed)
      .onConflictDoNothing({ target: jobs.jobId })
      .returning() as any

    if (!created)
      return

    const promises = created.map(async (job) => {
      for (const type of JOB_CHUNK_TYPES) {
        const raw = job[type]
        if (!raw)
          continue

        const cleaning = clean(raw)
        if (!cleaning)
          continue

        const chunks = chunk(cleaning)
        const embeddings = await embedMany(chunks)

        await tx.insert(jobChunks).values(
          chunks.map((c, i) => ({
            jobId: job.jobId,
            type,
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
