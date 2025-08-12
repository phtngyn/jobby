import { db } from '~~/db'
import { jobs } from '~~/db/schema/jobs'

export default defineEventHandler(async (_event) => {
  const result = await db
    .select()
    .from(jobs)
    .limit(100)

  return result
})
