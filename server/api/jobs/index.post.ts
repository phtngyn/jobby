import { db, desc } from '~~/db'
import { jobs } from '~~/db/schema/jobs'

export default defineEventHandler(async () => {
  // const { ids } = await readValidatedBody(
  //   event,
  //   z.object({ ids: z.array(z.string()) }).parse,
  // )

  const result = await db
    .select()
    .from(jobs)
    // .where(ids.length ? inArray(jobs.id, ids) : sql`TRUE`)
    .orderBy(desc(jobs.modifiedAt))
    .limit(10)

  return result
})
