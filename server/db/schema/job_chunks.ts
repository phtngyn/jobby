import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  vector,
} from 'drizzle-orm/pg-core'
import { jobs } from './jobs'

const jobChunkTypeEnum = pgEnum('job_chunk_type', [
  'jobId',
  'angebotstitel',
  'kurzbeschreibung',
  'firma',
  'emailAnsprechpartner',
  'freigabedatum',
  'arbeitsort',
  'anzeigeText',
  'country',
  'einleitungTitel',
  'einleitungText',
  'aufgabenTitel',
  'aufgabenText',
  'erwartungenTitel',
  'erwartungenText',
  'angebotTitel',
  'angebotText',
  'kontaktTitel',
  'kontaktText',
  'spracheDeutsch',
  'spracheLand',
  'arbeitszeitMin',
  'arbeitszeitMax',
  'berufsfelder',
  'fachbereiche',
  'homeoffice',
  'jobtypen',
])

export const jobChunks = pgTable(
  'job_chunks',
  {
    id: serial('id').primaryKey(),
    jobId: text('job_id').notNull().references(() => jobs.jobId),
    type: jobChunkTypeEnum('type').notNull(),
    chunkIndex: integer('chunk_index').notNull().default(0),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }).notNull(),
  },
  t => [
    index('idx_job_chunks_embedding')
      .using('hnsw', t.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 200 }),
    index('idx_job_chunks_job_id').on(t.jobId),
  ],
)
