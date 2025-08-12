import { drizzle } from 'drizzle-orm/node-postgres'
import { connection } from '~~/configs/db'
import { jobs } from '~~/db/schema/jobs'

export const db = drizzle({
  connection,
  schema: { jobs },
})
