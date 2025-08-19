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
  einleitungTitel: z.string().optional().optional(),
  einleitungText: z.string().optional().optional(),
  aufgabenTitel: z.string().optional().optional(),
  aufgabenText: z.string().optional().optional(),
  erwartungenTitel: z.string().optional().optional(),
  erwartungenText: z.string().optional().optional(),
  angebotTitel: z.string().optional().optional(),
  angebotText: z.string().optional().optional(),
  kontaktTitel: z.string().optional().optional(),
  kontaktText: z.string().optional().optional(),
  spracheDeutsch: z.boolean(),
  spracheLand: z.boolean(),
  arbeitszeitMin: z.number().int(),
  arbeitszeitMax: z.number().int(),
  berufsfelder: z.string(),
  fachbereiche: z.string(),
  homeoffice: z.string(),
  jobtypen: z.string(),
})

export const FiltersSchema = z.object({
  search: z.string(),
  types: z.array(z.string()),
  fields: z.array(z.string()),
  domains: z.array(z.string()),
  homeoffices: z.array(z.string()),
  workingtimes: z.array(z.number()).length(2),
})

export const ChatMetadataSchema = z.object({
  model: z.string().optional(),
  duration: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  finishReason: z.string().optional(),
})

export const ChatDataPartStatus = z.enum(['loading', 'done'])

export const ChatDataPartClassificationSchema = z.object({
  reasoning: z.string().max(200),
  type: z.enum(['general', 'job_search', 'update_filters']),
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
