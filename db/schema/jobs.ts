import { sql } from 'drizzle-orm'
import { boolean, index, numeric, pgEnum, pgTable, serial, text, timestamp, varchar, vector } from 'drizzle-orm/pg-core'

export const TypeEnum = pgEnum('job_type', [
  'SELBSTAENDIGKEIT',
  'PRAKTIKUM_TRAINEE',
  'KUENSTLER',
  'AUSBILDUNG',
  'ARBEIT',
])

export const WorktimeEnum = pgEnum('job_worktime', [
  'FULLTIME',
  'PARTTIME',
])

export const DurationEnum = pgEnum('job_duration', [
  'KEINE_ANGABE',
  'BEFRISTET',
  'UNBEFRISTET',
])

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  occupation: text('occupation'),
  type: TypeEnum('type'),
  description: text('description'),
  worktime: WorktimeEnum('worktime'),
  homeoffice: boolean('homeoffice').notNull().default(false),
  duration: DurationEnum('duration'),
  supervised: boolean('supervised').notNull().default(false),
  salary: text('salary'),
  employer: text('employer'),
  url: text('url'),
  publishAt: timestamp('publish_from', { withTimezone: true, mode: 'string' }),
  modifiedAt: timestamp('update_from', { withTimezone: true, mode: 'string' }),
  street: text('street'),
  zip: text('zip'),
  city: text('city'),
  region: text('region'),
  country: text('country'),
  lat: numeric('lat', { precision: 7, scale: 4, mode: 'number' }),
  lon: numeric('lon', { precision: 7, scale: 4, mode: 'number' }),
}, table => [
  index('jobs_fts_idx').using(
    'gin',
    sql`to_tsvector('german', COALESCE(${table.title}, '') || ' ' || COALESCE(${table.occupation}, '') || ' ' || COALESCE(${table.description}, ''))`,
  ),
])

export const jobEmbeddings = pgTable('job_embeddings', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 50 }).notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }).notNull(),
}, table => [
  index('job_embeddings_job_id_idx').on(table.jobId),
  index('job_embeddings_embedding_idx').using('hnsw', table.embedding.asc().nullsLast().op('vector_cosine_ops')),
])
