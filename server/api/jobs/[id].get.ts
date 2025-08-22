import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string() }).parse,
  )

  const job = await db.query.jobs.findFirst({
    where: job => eq(job.jobId, id),
  })

  return job
})
