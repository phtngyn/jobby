import { drizzle } from 'drizzle-orm/node-postgres'
import { connection } from '~~/configs/db'
import * as jobsSchema from '../db/schema/jobs'
import * as usersSchema from '../db/schema/users'

export const tables = { ...jobsSchema, ...usersSchema }
export const db = drizzle({ connection, schema: tables })
