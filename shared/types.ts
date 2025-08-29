import type { UserSession, UserSessionRequired } from '#auth-utils'
import type { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { InferUITools, ToolUIPart, UIMessage, UIMessagePart, UIMessageStreamWriter } from 'ai'
import type { z, ZodType } from 'zod'
import type { getToolbox } from '~~/server/ai/tools'

import type { ChatDataPartSchema, ChatMetadataSchema, FactualMemorySchema, FiltersSchema, JobSchema } from './schemas'

export type Job = z.infer<typeof JobSchema>

export type JobType = NonNullable<Job['jobtypen']>
export type JobHomeoffice = NonNullable<Job['homeoffice']>

export type ChatModelKey = Parameters<ReturnType<typeof createGoogleGenerativeAI>>[0]
export interface ChatModel { key: ChatModelKey, name: string, company: string }

export interface ChatConfig { model: ChatModelKey, filters: Filters }

export type ChatMetadata = z.infer<typeof ChatMetadataSchema>

export type ChatDataPart = z.infer<typeof ChatDataPartSchema>

export type ChatTools = ReturnType<typeof getToolbox>
export type ChatToolKeys = keyof ChatTools
export type ChatToolSet = InferUITools<{ [K in ChatToolKeys]: ReturnType<ChatTools[K]>; }>

export type ChatUIMessagePart = UIMessagePart<ChatDataPart, ChatToolSet>
export type ChatUIMessage = UIMessage<ChatMetadata, ChatDataPart, ChatToolSet>
export type ChatWriter = UIMessageStreamWriter<ChatUIMessage>

// eslint-disable-next-line unused-imports/no-unused-vars
type GetToolUIPartState<T extends ZodType> = ToolUIPart & {
  state: ToolUIPart['state']
  output?: z.infer<T>
}

export type Filters = z.infer<typeof FiltersSchema>

export type FactualMemory = z.infer<typeof FactualMemorySchema>

export type Session = UserSession | UserSessionRequired
