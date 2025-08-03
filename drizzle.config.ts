import { defineConfig } from 'drizzle-kit'
import { connection } from './configs/db'

export default defineConfig({
  dialect: 'postgresql',
  out: './db',
  schema: './db/schema',
  dbCredentials: connection,
})
