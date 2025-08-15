import type { SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

import {
  boolean,
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

const tsvector = customType<{ data: string }>({
  dataType() {
    return `tsvector`
  },
})

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

    search: tsvector('search')
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`
            setweight(to_tsvector('german', ${jobs.angebotstitel}), 'A')
            ||
            setweight(to_tsvector('german', ${jobs.kurzbeschreibung}), 'A')
            ||
            setweight(to_tsvector('german', ${jobs.aufgabenText}), 'B')
            ||
            setweight(to_tsvector('german', ${jobs.erwartungenText}), 'B')
            ||
            setweight(to_tsvector('german', ${jobs.firma}), 'B')
            ||
            setweight(to_tsvector('german', ${jobs.arbeitsort}), 'B')
            ||
            setweight(to_tsvector('german', ${jobs.anzeigeText}), 'C')
            ||
            setweight(to_tsvector('german', ${jobs.fachbereiche}), 'C')
            ||
            setweight(to_tsvector('german', ${jobs.berufsfelder}), 'C')`,
      ),
  },
  t => [
    index('idx_jobs_search').using('gin', t.search),
  ],
)
