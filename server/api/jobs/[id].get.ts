import { z } from 'zod'
import { db, eq } from '~~/db'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string() }).parse,
  )

  const job = await db.query.jobs.findFirst({
    where: job => eq(job.id, id),
  })

  return job
})
