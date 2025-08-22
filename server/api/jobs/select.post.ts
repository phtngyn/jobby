import type { SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { and, desc, getTableColumns, gte, inArray, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { JobsTable } from '~~/server/db/schema/jobs'
import { db } from '~~/server/utils/drizzle'
import { JOB_SEARCH_TARGET_ORIGIN_COLUMNS } from '~~/shared/constants'
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
    if (body.filters.search) {
      const query = body.filters.search

      const condition = sql.join(
        JOB_SEARCH_TARGET_ORIGIN_COLUMNS.map(
          c => sql`${sql.identifier(c)} @@@ ${query}`,
        ),
        sql` OR `,
      )

      conditions.push(sql`(${condition})`)

      score = sql<number>`paradedb.score(job_id)`.as('score')
    }

    if (body.filters.types?.length) {
      const condition = buildArrayIncludeCondition(body.filters.types, JobsTable.jobtypen)
      conditions.push(condition)
    }

    if (body.filters.fields?.length) {
      const condition = buildArrayIncludeCondition(body.filters.fields, JobsTable.berufsfelder)
      conditions.push(condition)
    }

    if (body.filters.domains?.length) {
      const condition = buildArrayIncludeCondition(body.filters.domains, JobsTable.fachbereiche)
      conditions.push(condition)
    }

    if (body.filters.homeoffices?.length) {
      const condition = buildArrayIncludeCondition(body.filters.homeoffices, JobsTable.homeoffice)
      conditions.push(condition)
    }

    if (body.filters.workingtimes?.length) {
      const min = body.filters.workingtimes[0]!
      const max = body.filters.workingtimes[1]!
      const condition = and(lte(JobsTable.arbeitszeitMin, max), gte(JobsTable.arbeitszeitMax, min))
      conditions.push(condition)
    }
  }

  if (body.jobIds) {
    conditions.push(inArray(JobsTable.jobId, body.jobIds))
  }

  const result = await db
    .select(
      score
        ? { score, ...getTableColumns(JobsTable) }
        : getTableColumns(JobsTable),
    )
    .from(JobsTable)
    .where(conditions.length > 0 ? and(...conditions) : sql`TRUE`)
    .orderBy(score ? desc(score) : desc(JobsTable.freigabedatum))

  return result
})

function buildArrayIncludeCondition(filter: string[], column: PgColumn) {
  const array = sql`ARRAY[${sql.join(filter.map(t => sql`${t}`), sql`, `)}]`
  const condition = sql`string_to_array(${column}, '|') && ${array}`
  return condition
}
