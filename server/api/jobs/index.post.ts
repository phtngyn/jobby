import type { SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { and, desc, getTableColumns, gte, inArray, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db, tables } from '~~/server/utils/drizzle'
import { JOB_SEARCH_TARGET_COLUMNS } from '~~/shared/constants'
import { FiltersSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      filters: FiltersSchema.optional(),
      job_ids: z.array(z.string()).optional(),
      limit: z.int().nonnegative().optional(),
    }).parse,
  )

  const conditions: (SQL | undefined)[] = []
  let score: SQL.Aliased<number> | undefined

  if (body.filters) {
    if (body.filters.search) {
      const query = body.filters.search

      const condition = sql.join(
        JOB_SEARCH_TARGET_COLUMNS.map(
          c => sql`${sql.identifier(c)} @@@ ${query}`,
        ),
        sql` OR `,
      )

      conditions.push(sql`(${condition})`)

      score = sql<number>`paradedb.score(id)`.as('score')
    }

    if (body.filters.types?.length) {
      const condition = buildArrayIncludeCondition(body.filters.types, tables.jobs.types)
      conditions.push(condition)
    }

    if (body.filters.fields?.length) {
      const condition = buildArrayIncludeCondition(body.filters.fields, tables.jobs.fields)
      conditions.push(condition)
    }

    if (body.filters.categories?.length) {
      const condition = buildArrayIncludeCondition(body.filters.categories, tables.jobs.categories)
      conditions.push(condition)
    }

    if (body.filters.homeoffices?.length) {
      const condition = buildArrayIncludeCondition(body.filters.homeoffices, tables.jobs.homeoffice)
      conditions.push(condition)
    }

    if (body.filters.workingtimes?.length) {
      const min = body.filters.workingtimes[0]!
      const max = body.filters.workingtimes[1]!
      const condition = and(
        lte(tables.jobs.worktime_min, max),
        gte(tables.jobs.worktime_max, min),
      )
      conditions.push(condition)
    }
  }

  if (body.job_ids) {
    conditions.push(inArray(tables.jobs.id, body.job_ids))
  }

  const query = db
    .select(
      score
        ? { score, ...getTableColumns(tables.jobs) }
        : getTableColumns(tables.jobs),
    )
    .from(tables.jobs)
    .where(conditions.length > 0 ? and(...conditions) : sql`TRUE`)
    .orderBy(score ? desc(score) : desc(tables.jobs.updated_at))

  if (body.limit)
    query.limit(body.limit)

  const result = await query

  return result
})

function buildArrayIncludeCondition(filter: string[], column: PgColumn) {
  const array = sql`ARRAY[${sql.join(filter.map(t => sql`${t}`), sql`, `)}]`
  const condition = sql`string_to_array(${column}, '|') && ${array}`
  return condition
}
