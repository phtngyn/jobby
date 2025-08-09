import type { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ToolUIPart } from 'ai'
import type { z, ZodType } from 'zod'
import type { jobEmbeddings, jobs } from '~~/db/schema/jobs'
import type { FindJobOutputSchema } from '../server/ai/tools/find_job'
import type { FilterItemWithChildrenSchema, FilterItemWithoutChildrenSchema, FiltersSchema, MetadataSchema } from './schemas'

export type Job = typeof jobs.$inferSelect
export type JobNoDescription = Omit<Job, 'description'>
export type JobEmbedding = typeof jobEmbeddings.$inferSelect
export type NewJobEmbedding = typeof jobEmbeddings.$inferInsert

export type JobType = NonNullable<Job['type']>
export type JobWorktime = NonNullable<Job['worktime']>
export type JobDuration = NonNullable<Job['duration']>

export type ModelKey = Parameters<ReturnType<typeof createGoogleGenerativeAI>>[0]
export interface Model { key: ModelKey, name: string, company: string }

export interface ChatConfig { model: ModelKey, search: boolean }

export type Metadata = z.infer<typeof MetadataSchema>

type GetToolUIPartState<T extends ZodType> = ToolUIPart & {
  state: ToolUIPart['state']
  output?: z.infer<T>
}
export type FindJobToolUIPart = GetToolUIPartState<typeof FindJobOutputSchema>

export type FilterItemWithChildren = z.infer<typeof FilterItemWithChildrenSchema>
export type FilterItemWithoutChildren = z.infer<typeof FilterItemWithoutChildrenSchema>
export type Filters = z.infer<typeof FiltersSchema>
