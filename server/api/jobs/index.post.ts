import { jobs } from '~~/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'

export default defineEventHandler(async (_event) => {
  const result = await db
    .select()
    .from(jobs)
    .limit(100)

  return result
})
