import { drizzle } from 'drizzle-orm/node-postgres'
import { connection } from '~~/configs/db'
import { JobChunksTable } from '../db/schema/job_chunks'
import { JobsTable } from '../db/schema/jobs'

export const db = drizzle({
  connection,
  schema: { jobs: JobsTable, jobChunks: JobChunksTable },
})
