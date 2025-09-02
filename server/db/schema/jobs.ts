import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from 'drizzle-orm/pg-core'
import { JOB_SEARCH_TARGET_COLUMNS } from '../../../shared/constants'

export const job_chunk_type = pgEnum('job_chunk_type', JOB_SEARCH_TARGET_COLUMNS)

export const jobs = pgTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    updated_at: timestamp('updated_at', { withTimezone: false }).notNull(),

    company: text('company').notNull(),
    email: text('email'),
    application_portal: text('application_portal'),

    location: text('location').notNull(),
    homeoffice: text('homeoffice'),

    worktime_min: integer('worktime_min'),
    worktime_max: integer('worktime_max'),
    start_date: timestamp('start_date', { withTimezone: false }),
    end_date: timestamp('end_date', { withTimezone: false }),

    language_country: boolean('language_country').default(false),
    language_german: boolean('language_german').default(false),

    categories: text('categories').notNull(),
    types: text('types').notNull(),
    fields: text('fields').notNull(),

    short_description: text('short_description'),

    intro_title: text('intro_title'),
    intro_text: text('intro_text'),

    tasks_title: text('tasks_title'),
    tasks_text: text('tasks_text'),

    expectations_title: text('expectations_title'),
    expectations_text: text('expectations_text'),

    offer_title: text('offer_title'),
    offer_text: text('offer_text'),

    contact_title: text('contact_title'),
    contact_text: text('contact_text'),
  },
  t => [
    index('idx_job_search')
      .using(
        'bm25',
        t.id,
        t.title,
        t.company,
        t.location,
        t.fields,
        t.short_description,
        t.intro_text,
        t.tasks_text,
        t.expectations_text,
        t.offer_text,
      )
      .with({ key_field: 'id' }),
  ],
)

export const job_chunks = pgTable(
  'job_chunks',
  {
    id: serial('id').primaryKey(),
    job_id: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    type: job_chunk_type('type').notNull(),
    chunk_index: integer('chunk_index').notNull().default(0),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  },
  t => [
    index('idx_job_chunks_job_id').on(t.id),

    index('idx_job_chunks_embedding')
      .using('hnsw', t.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 200 }),

    index('idx_job_chunk_search')
      .using(
        'bm25',
        t.id,
        t.content,
      )
      .with({ key_field: 'id' }),
  ],
)
