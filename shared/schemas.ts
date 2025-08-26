import { z } from 'zod'

export const JobSchema = z.object({
  jobId: z.string(),
  angebotstitel: z.string(),
  kurzbeschreibung: z.string(),
  firma: z.string(),
  emailAnsprechpartner: z.email(),
  freigabedatum: z.iso.datetime(),
  arbeitsort: z.string(),
  anzeigeText: z.string(),
  country: z.string(),
  einleitungTitel: z.string().optional(),
  einleitungText: z.string().optional(),
  aufgabenTitel: z.string().optional(),
  aufgabenText: z.string().optional(),
  erwartungenTitel: z.string().optional(),
  erwartungenText: z.string().optional(),
  angebotTitel: z.string().optional(),
  angebotText: z.string().optional(),
  kontaktTitel: z.string().optional(),
  kontaktText: z.string().optional(),
  spracheDeutsch: z.boolean(),
  spracheLand: z.boolean(),
  arbeitszeitMin: z.number().int().nonnegative(),
  arbeitszeitMax: z.number().int().nonnegative(),
  berufsfelder: z.string(),
  fachbereiche: z.string(),
  homeoffice: z.string(),
  jobtypen: z.string(),
})

export const FiltersSchema = z.object({
  search: z.string().trim().optional(),
  types: z.array(z.string()).optional(),
  fields: z.array(z.string()).optional(),
  domains: z.array(z.string()).optional(),
  homeoffices: z.array(z.string()).optional(),
  workingtimes: z.array(z.number()).length(2).optional(),
})

export const ChatMetadataSchema = z.object({
  stats: z.object({
    model: z.string().optional(),
    duration: z.number().optional(),
    totalTokens: z.number().optional(),
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
    finishReason: z.string().optional(),
  }).optional(),
  analyse_jobs: z.array(z.object({ id: z.string(), title: z.string() })).optional(),
})

export const ChatDataPartStatus = z.enum(['loading', 'done'])

export const ChatDataPartClassificationSchema = z.object({
  reason: z.string().max(200),
  type: z.enum([
    'general',
    'get_jobs',
    'get_similar_jobs',
    'analyze_jobs',
    'get_filters',
  ]),
  confidence: z.number().min(0).max(1),
  status: ChatDataPartStatus,
})

export const ChatDataPartSchema = z.object({
  classification: ChatDataPartClassificationSchema,
  notification: z.object({
    message: z.string(),
    level: z.enum(['info', 'warning', 'error']),
  }),
})

export const ExtractionSchema = z.object({
  profile: z.object({
    current_role: z.string().optional(),
    study_field: z.string().optional(),
    seniority: z.string().optional(),
    years_experience: z.number().int().optional(),
    skills: z.array(z.string()).optional(),
  }),

  preferences: z.object({
    job_types: z.array(z.string()).optional(),
    domains_of_interest: z.array(z.string()).optional(),
    preferred_locations: z.array(z.string()).optional(),
    work_mode: z.enum(['on-site', 'hybrid', 'remote', 'no_preference']).optional(),
    hours_per_week: z.object({
      min: z.number().int().optional(),
      max: z.number().int().optional(),
    }).optional(),
  }),

  episodic_summary: z.string().max(200),
  confidence: z.number().min(0).max(1),
})
