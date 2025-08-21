import type { SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { and, desc, getTableColumns, gte, inArray, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { jobs } from '~~/server/db/schema/jobs'
import { db } from '~~/server/uitls/drizzle'
import { FiltersSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      filters: FiltersSchema.optional(),
      jobIds: z.array(z.string()).optional(),
    }).parse,
  )

  const conditions: (SQL | undefined)[] = []
  let score: SQL.Aliased<number> | undefined

  if (body.filters) {
    if (body.filters.search?.trim()) {
      const query = body.filters.search.trim().split(/\s+/).map(x => `${x}:*`).join(' | ')
      const condition = sql`${jobs.search} @@ to_tsquery('german', ${query})`
      conditions.push(condition)

      score = sql<number>`ts_rank_cd(${jobs.search}, to_tsquery('german', ${query}), 32 | 64)`.as('score')
    }

    if (body.filters.types?.length) {
      const condition = buildArrayIncludeCondition(body.filters.types, jobs.jobtypen)
      conditions.push(condition)
    }

    if (body.filters.fields?.length) {
      const condition = buildArrayIncludeCondition(body.filters.fields, jobs.berufsfelder)
      conditions.push(condition)
    }

    if (body.filters.domains?.length) {
      const condition = buildArrayIncludeCondition(body.filters.domains, jobs.fachbereiche)
      conditions.push(condition)
    }

    if (body.filters.homeoffices?.length) {
      const condition = buildArrayIncludeCondition(body.filters.homeoffices, jobs.homeoffice)
      conditions.push(condition)
    }

    if (body.filters.workingtimes?.length) {
      const min = body.filters.workingtimes[0]!
      const max = body.filters.workingtimes[1]!
      const condition = and(lte(jobs.arbeitszeitMin, max), gte(jobs.arbeitszeitMax, min))
      conditions.push(condition)
    }
  }

  if (body.jobIds) {
    conditions.push(inArray(jobs.jobId, body.jobIds))
  }

  const { search, ...rest } = getTableColumns(jobs)

  const result = await db
    .select(
      score
        ? { ...rest, score }
        : { ...rest },
    )
    .from(jobs)
    .where(conditions.length > 0 ? and(...conditions) : sql`TRUE`)
    .orderBy(score ? sql`score DESC` : desc(jobs.freigabedatum))

  return result
})

function buildArrayIncludeCondition(filter: string[], column: PgColumn) {
  const array = sql`ARRAY[${sql.join(filter.map(t => sql`${t}`), sql`, `)}]`
  const condition = sql`string_to_array(${column}, '|') && ${array}`
  return condition
}
