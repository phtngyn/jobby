import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  vector,
} from 'drizzle-orm/pg-core'
import { JOB_CHUNK_TYPES } from '../../../shared/constants'
import { jobs } from './jobs'

export const jobChunkTypeEnum = pgEnum('job_chunk_type', JOB_CHUNK_TYPES)

export const jobChunks = pgTable(
  'job_chunks',
  {
    id: serial('id').primaryKey(),
    jobId: text('job_id').notNull().references(() => jobs.jobId, { onDelete: 'cascade' }),
    type: jobChunkTypeEnum('type').notNull(),
    chunkIndex: integer('chunk_index').notNull().default(0),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  },
  t => [
    index('idx_job_chunks_embedding')
      .using('hnsw', t.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 200 }),
    index('idx_job_chunks_job_id').on(t.jobId),
  ],
)
