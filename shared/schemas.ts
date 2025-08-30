import { z } from 'zod'
import { JOB_CATEGORIES, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES } from './constants'

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  updated_at: z.date(),

  company: z.string(),
  email: z.string().nullable().optional(),
  application_portal: z.string().nullable().optional(),

  location: z.string(),
  homeoffice: z.string().nullable().optional(),

  worktime_min: z.number().int().nullable().optional(),
  worktime_max: z.number().int().nullable().optional(),
  start_date: z.date().nullable().optional(),
  end_date: z.date().nullable().optional(),

  language_country: z.boolean().default(false),
  language_german: z.boolean().default(false),

  fields: z.string(),
  categories: z.string(),
  types: z.string(),

  short_description: z.string().nullable().optional(),
  intro_title: z.string().nullable().optional(),
  intro_text: z.string().nullable().optional(),
  tasks_title: z.string().nullable().optional(),
  tasks_text: z.string().nullable().optional(),
  expectations_title: z.string().nullable().optional(),
  expectations_text: z.string().nullable().optional(),
  offer_title: z.string().nullable().optional(),
  offer_text: z.string().nullable().optional(),
  contact_title: z.string().nullable().optional(),
  contact_text: z.string().nullable().optional(),
})

export const FiltersSchema = z.object({
  search: z.string().trim().optional(),
  categories: z.array(z.enum(JOB_CATEGORIES)).optional(),
  types: z.array(z.enum(JOB_TYPES)).optional(),
  fields: z.array(z.enum(JOB_FIELDS)).optional(),
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
      categories: z
        .array(z.enum(JOB_CATEGORIES))
        .optional()
        .describe(
          'Job categories explicitly mentioned by the user. Must be one of JOB_CATEGORIES.',
        ),
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
