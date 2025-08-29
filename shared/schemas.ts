import { z } from 'zod'
import { JOB_DOMAINS, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES } from './constants'

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
  types: z.array(z.enum(JOB_TYPES)).optional(),
  fields: z.array(z.enum(JOB_FIELDS)).optional(),
  domains: z.array(z.enum(JOB_DOMAINS)).optional(),
  homeoffices: z.array(z.enum(JOB_HOMEOFFICES)).optional(),
  workingtimes: z.array(z.number().min(0).max(60)).length(2).optional(),
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

export const UsernameSchema = z.string().trim().min(3, 'Must be at least 3 characters')

export const FactualMemorySchema = z.object({
  filters: z
    .object({
      types: z
        .array(z.enum(JOB_TYPES))
        .optional()
        .describe(
          'Job types explicitly mentioned by the user. Must be one of JOB_TYPES.',
        ),
      fields: z
        .array(z.enum(JOB_FIELDS))
        .optional()
        .describe(
          'Job fields or industries explicitly mentioned by the user. Must be one of JOB_FIELDS.',
        ),
      domains: z
        .array(z.enum(JOB_DOMAINS))
        .optional()
        .describe(
          'Academic or study domains explicitly mentioned by the user. Must be one of JOB_DOMAINS.',
        ),
      homeoffices: z
        .array(z.enum(JOB_HOMEOFFICES))
        .optional()
        .describe(
          'User\'s explicit preference for remote or hybrid work. Must be one of JOB_HOMEOFFICES.',
        ),
      workingtimes: z
        .array(z.number().min(0).max(60))
        .min(1)
        .max(2)
        .optional()
        .describe('Working time range in hours per week. Always normalized to [min, max].'),
    })
    .optional()
    .describe(
      'Structured filters that directly map to the job search system. Only include fields explicitly mentioned by the user.',
    ),

  others: z
    .array(
      z.object({
        key: z.string().describe('The name of the preference'),
        value: z.string().describe('The value of the preference'),
      }),
    )
    .optional()
    .describe('Any other explicit preferences that do not fit into filters.'),
})
