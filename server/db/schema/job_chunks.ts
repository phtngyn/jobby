import { index, integer, pgEnum, pgTable, serial, text, vector } from 'drizzle-orm/pg-core'
import { JOB_SEARCH_TARGET_COLUMNS } from '../../../shared/constants'
import { JobsTable } from './jobs'

export const JobChunkTypeEnum = pgEnum('job_chunk_type', JOB_SEARCH_TARGET_COLUMNS)

export const JobChunksTable = pgTable(
  'job_chunks',
  {
    id: serial('id').primaryKey(),
    jobId: text('job_id').notNull().references(() => JobsTable.jobId, { onDelete: 'cascade' }),
    type: JobChunkTypeEnum('type').notNull(),
    chunkIndex: integer('chunk_index').notNull().default(0),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  },
  t => [
    index('idx_job_chunks_job_id').on(t.jobId),

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
