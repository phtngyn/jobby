import type { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ToolUIPart } from 'ai'
import type { z, ZodType } from 'zod'
import type { FiltersSchema, JobSchema, MetadataSchema } from './schemas'

export type Job = z.infer<typeof JobSchema>

export type JobType = NonNullable<Job['jobtypen']>
export type JobHomeoffice = NonNullable<Job['homeoffice']>

export type ModelKey = Parameters<ReturnType<typeof createGoogleGenerativeAI>>[0]
export interface Model { key: ModelKey, name: string, company: string }

export interface ChatConfig { model: ModelKey, search: boolean }

export type Metadata = z.infer<typeof MetadataSchema>

// eslint-disable-next-line unused-imports/no-unused-vars
type GetToolUIPartState<T extends ZodType> = ToolUIPart & {
  state: ToolUIPart['state']
  output?: z.infer<T>
}

export type Filters = z.infer<typeof FiltersSchema>
