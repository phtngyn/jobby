import type { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ToolUIPart } from 'ai'
import type { z, ZodType } from 'zod'
import type { jobEmbeddings, jobs } from '~~/db/schema/jobs'
import type { FindFilterOutputSchema } from '~~/server/ai/tools/find_filter'
import type { FindJobOutputSchema } from '../server/ai/tools/find_job'
import type { FilterEnum, MetadataSchema } from './schemas'

export type Job = typeof jobs.$inferSelect
export type JobNoDescription = Omit<Job, 'description'>
export type JobEmbedding = typeof jobEmbeddings.$inferSelect
export type NewJobEmbedding = typeof jobEmbeddings.$inferInsert

export type Model = Parameters<ReturnType<typeof createGoogleGenerativeAI>>[0]
export interface ChatConfig { model: Model, search: boolean }

export type Metadata = z.infer<typeof MetadataSchema>

type GetToolUIPartState<T extends ZodType> = ToolUIPart & {
  state: ToolUIPart['state']
  output?: z.infer<T>
}
export type FindJobToolUIPart = GetToolUIPartState<typeof FindJobOutputSchema>
export type FindFilterToolUIPart = GetToolUIPartState<typeof FindFilterOutputSchema>

export type Filter = z.infer<typeof FilterEnum>
