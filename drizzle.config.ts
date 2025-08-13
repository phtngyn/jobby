import { defineConfig } from 'drizzle-kit'
import { connection } from './configs/db'

export default defineConfig({
  dialect: 'postgresql',
  out: './server/db',
  schema: './server/db/schema',
  dbCredentials: connection,
})
