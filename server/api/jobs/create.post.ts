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
  const created = await db.insert(jobs).values(parsed).returning()

  for (const job of created) {
    for (const type of JOB_CHUNK_TYPES) {
      const raw = job[type]
      if (!raw)
        continue

      const cleaning = clean(raw)
      if (!cleaning)
        continue

      const chunks = chunk(cleaning)
      const embeddings = await embedMany(chunks, { type: 'RETRIEVAL_DOCUMENT' })
      for (let i = 0; i < embeddings.length; i++) {
        await db.insert(jobChunks).values({
          jobId: job.jobId,
          type,
          chunkIndex: i,
          content: chunks[i],
          embedding: embeddings[i],
        })
      }
    }
  }
})
