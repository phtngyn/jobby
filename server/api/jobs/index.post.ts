import type { JobDuration, JobType, JobWorktime } from '~~/shared/types'
import { z } from 'zod'
import { and, db, eq, inArray, sql } from '~~/db'
import { jobs } from '~~/db/schema/jobs'
import { FiltersSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  console.log('called')
  const { filters } = await readValidatedBody(event, z.object({ filters: FiltersSchema }).parse)

  const search = filters.search
  const types = filters.type.children.flatMap(x => x.checked ? [x.value] : []) as JobType[]
  const worktimes = filters.worktime.children.flatMap(x => x.checked ? [x.value] : []) as JobWorktime[]
  const durations = filters.duration.children.flatMap(x => x.checked ? [x.value] : []) as JobDuration[]
  const homeoffice = filters.homeoffice.checked

  const conditions = [
    types.length ? inArray(jobs.type, types) : sql`TRUE`,
    worktimes.length ? inArray(jobs.worktime, worktimes) : sql`TRUE`,
    durations.length ? inArray(jobs.duration, durations) : sql`TRUE`,
    homeoffice ? eq(jobs.homeoffice, true) : sql`TRUE`,
  ]

  if (search) {
    conditions.push(
      sql`to_tsvector('german', 
        COALESCE(${jobs.title}, '') || ' ' || 
        COALESCE(${jobs.occupation}, '') || ' ' || 
        COALESCE(${jobs.description}, '')
      ) @@ plainto_tsquery('german', ${search})`,
    )
  }

  const result = await db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .limit(100)

  return result
})
