import { drizzle } from 'drizzle-orm/node-postgres'
import { connection } from '~~/configs/db'
import { job_chunks, jobs } from '../db/schema/jobs'
import { chats, factualMemories, users } from '../db/schema/users'

export const tables = { jobs, job_chunks, users, chats, factualMemories }

export const db = drizzle({
  connection,
  schema: tables,
})
