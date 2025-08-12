import { and, asc, cosineDistance, desc, eq, gt, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { connection } from '../configs/db'
import { jobs } from './schema/jobs'

export const db = drizzle({
  connection,
  schema: { jobs },
})

export { and, asc, cosineDistance, desc, eq, gt, gte, inArray, lt, lte, sql }
