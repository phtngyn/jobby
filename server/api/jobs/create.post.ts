import { z } from 'zod'
import { db } from '~~/db'
import { jobs } from '~~/db/schema/jobs'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { jobs: _jobs } = await readValidatedBody(
    event,
    z.object({ jobs: JobSchema.array() }).parse,
  )

  await db.insert(jobs).values(_jobs.map(j => ({
    ...j,
    freigabedatum: new Date(j.freigabedatum),
  })))
})
