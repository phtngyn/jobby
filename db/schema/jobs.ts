import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const jobtypenEnum = pgEnum('jobtypen_enum', [
  'Werkstudierendenstelle und HiWi-Stellen',
  'Traineeprogramm',
  'Berufserfahrene',
  'DoktorandInnen',
  'Arbeitsstelle',
  'Duales Studium',
  'MitgründerIn gesucht',
  'Ausbildung',
  'Berufseinstieg nach dem Studium',
  'Nebenjob (fachfremd)',
  'Abschlussarbeit',
  'Praktikum',
])

export const homeofficeEnum = pgEnum('homeoffice_enum', [
  '0% Homeoffice',
  '0-49% Homeoffice',
  '50-100% Homeoffice',
  '100% Homeoffice',
])

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
    berufsfelder: text('berufsfelder').array().notNull(),
    fachbereiche: text('fachbereiche').array().notNull(),
    homeoffice: homeofficeEnum('homeoffice').array().notNull(),
    jobtypen: jobtypenEnum('jobtypen').array().notNull(),
  },
)
