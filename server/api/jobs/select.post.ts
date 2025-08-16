import type { SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { and, desc, getTableColumns, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { jobs } from '~~/server/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'
import { FiltersSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { filters } = await readValidatedBody(
    event,
    z.object({ filters: FiltersSchema }).parse,
  )

  const conditions: (SQL | undefined)[] = []
  let rank: SQL.Aliased | undefined

  if (filters.search?.trim()) {
    const query = filters.search.trim().split(/\s+/).map(x => `${x}:*`).join(' | ')
    const condition = sql`${jobs.search} @@ to_tsquery('german', ${query})`
    conditions.push(condition)

    rank = sql`ts_rank_cd(${jobs.search}, to_tsquery('german', ${query}))`.as('rank')
  }

  if (filters.types.length) {
    const condition = buildArrayIncludeCondition(filters.types, jobs.jobtypen)
    conditions.push(condition)
  }

  if (filters.fields.length) {
    const condition = buildArrayIncludeCondition(filters.fields, jobs.berufsfelder)
    conditions.push(condition)
  }

  if (filters.domains.length) {
    const condition = buildArrayIncludeCondition(filters.domains, jobs.fachbereiche)
    conditions.push(condition)
  }

  if (filters.homeoffices.length) {
    const condition = buildArrayIncludeCondition(filters.homeoffices, jobs.homeoffice)
    conditions.push(condition)
  }

  if (filters.workingtimes.length === 2) {
    const min = filters.workingtimes[0]!
    const max = filters.workingtimes[1]!
    const condition = and(lte(jobs.arbeitszeitMin, max), gte(jobs.arbeitszeitMax, min))
    conditions.push(condition)
  }

  const result = await db
    .select(
      rank
        ? { ...getTableColumns(jobs), rank }
        : getTableColumns(jobs),
    )
    .from(jobs)
    .where(conditions.length > 0 ? and(...conditions) : sql`TRUE`)
    .orderBy(rank ? sql`rank DESC` : desc(jobs.freigabedatum))
    .limit(100)

  return result
})

function buildArrayIncludeCondition(filter: string[], column: PgColumn) {
  const array = sql`ARRAY[${sql.join(filter.map(t => sql`${t}`), sql`, `)}]`
  const condition = sql`string_to_array(${column}, '|') && ${array}`
  return condition
}
