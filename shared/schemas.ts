import { z } from 'zod'

export const TypeEnum = z.enum([
  'SELBSTAENDIGKEIT',
  'PRAKTIKUM_TRAINEE',
  'KUENSTLER',
  'AUSBILDUNG',
  'ARBEIT',
])

export const WorktimeEnum = z.enum(['FULLTIME', 'PARTTIME'])

export const DurationEnum = z.enum(['KEINE_ANGABE', 'BEFRISTET', 'UNBEFRISTET'])

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  occupation: z.string().nullable(),
  type: TypeEnum.nullable(),
  description: z.string().nullable(),
  worktime: WorktimeEnum.nullable(),
  homeoffice: z.boolean().default(false),
  duration: DurationEnum.nullable(),
  supervised: z.boolean().default(false),
  salary: z.string().nullable(),
  employer: z.string().nullable(),
  url: z.string().nullable(),
  publishAt: z.iso.datetime({ offset: true }).nullable(),
  modifiedAt: z.iso.datetime({ offset: true }).nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
})
export type Job = z.infer<typeof JobSchema>

export const jobEmbeddingSchema = z.object({
  id: z.number().int().positive(),
  jobId: z.string().max(50),
  content: z.string(),
  embedding: z.array(z.number()).length(768),
})

export type JobEmbedding = z.infer<typeof jobEmbeddingSchema>

export const MetadataSchema = z.object({
  model: z.string().optional(),
  duration: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  finishReason: z.string().optional(),
})

export const FilterEnum = z.enum([
  'SELBSTAENDIGKEIT',
  'PRAKTIKUM_TRAINEE',
  'KUENSTLER',
  'AUSBILDUNG',
  'FULLTIME',
  'PARTTIME',
  'HOMEOFFICE',
  'BEFRISTET',
  'UNBEFRISTET',
  'SUPERVISED',
  'IN 7 DAYS',
  'IN A MONTH',
])
