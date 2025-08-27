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
    jobId: text('job_id').primaryKey(),
    angebotstitel: text('angebotstitel').notNull(),
    kurzbeschreibung: text('kurzbeschreibung').notNull(),
    firma: text('firma').notNull(),
    emailAnsprechpartner: text('email_ansprechpartner').notNull(),
    freigabedatum: timestamp('freigabedatum', { withTimezone: false }).notNull(),
    arbeitsort: text('arbeitsort').notNull(),
    anzeigeText: text('anzeige_text').notNull(),
    country: text('country').notNull(),
    einleitungTitel: text('einleitung_titel'),
    einleitungText: text('einleitung_text'),
    aufgabenTitel: text('aufgaben_titel'),
    aufgabenText: text('aufgaben_text'),
    erwartungenTitel: text('erwartungen_titel'),
    erwartungenText: text('erwartungen_text'),
    angebotTitel: text('angebot_titel'),
    angebotText: text('angebot_text'),
    kontaktTitel: text('kontakt_titel'),
    kontaktText: text('kontakt_text'),
    spracheDeutsch: boolean('sprache_deutsch').notNull(),
    spracheLand: boolean('sprache_land').notNull(),
    arbeitszeitMin: integer('arbeitszeit_min').notNull(),
    arbeitszeitMax: integer('arbeitszeit_max').notNull(),
    berufsfelder: text('berufsfelder').notNull(),
    fachbereiche: text('fachbereiche').notNull(),
    homeoffice: text('homeoffice').notNull(),
    jobtypen: text('jobtypen').notNull(),
  },
  t => [
    index('idx_job_search')
      .using(
        'bm25',
        t.jobId,
        t.angebotstitel,
        t.kurzbeschreibung,
        t.aufgabenText,
        t.erwartungenText,
        t.firma,
        t.arbeitsort,
        t.anzeigeText,
        t.fachbereiche,
        t.berufsfelder,
      )
      .with({ key_field: 'job_id' }),
  ],
)

export const job_chunks = pgTable(
  'job_chunks',
  {
    id: serial('id').primaryKey(),
    jobId: text('job_id').notNull().references(() => jobs.jobId, { onDelete: 'cascade' }),
    type: job_chunk_type('type').notNull(),
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
