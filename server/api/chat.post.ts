import type { TABLE_FILTER_DEFAULT } from '#shared/constants'
import type { UIMessage } from 'ai'
import type { ChatConfig, Filter, Job, Metadata } from '~~/shared/types'
import { CHAT_CONFIG_COOKIE, MODELS, TALBE_FILTER_COOKIE } from '#shared/constants'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  hasToolCall,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai'
import { destr } from 'destr'
import { provider } from '../ai/llm'
import { find_filter } from '../ai/tools/find_filter'
import { find_job } from '../ai/tools/find_job'
import { stringify } from '../ai/utils'
import { CHAT_SYSTEM_PROMPT } from '../prompts'

export default defineEventHandler(async (event) => {
  const { messages, jobs: attachedJobs = [] } = await readBody<{
    messages: UIMessage[]
    jobs?: Job[]
  }>(event)

  const config = destr<ChatConfig>(getCookie(event, CHAT_CONFIG_COOKIE))

  const model = MODELS[0]! = config.model && MODELS.includes(config.model)
    ? config.model
    : MODELS[0]!

  const tools = { find_job, find_filter }

  if (attachedJobs.length > 0) {
    messages.push({
      id: `${Date.now()}`,
      role: 'user',
      parts: [{
        type: 'text',
        text: [
          'The user has provided the following job posting details:',
          '',
          attachedJobs.map((j, i) => `Job ${i + 1}:\n${stringify(j)}`).join('\n\n'),
          '',
          'Please consider this information when answering the user\'s query.',
        ].join('\n'),
      }],
    })
  }

  const tableFilter = destr<typeof TABLE_FILTER_DEFAULT>(getCookie(event, TALBE_FILTER_COOKIE))
  if (tableFilter) {
    const currentFilters = Object.values(tableFilter).flatMap(x => [...x]).flatMap(x => x.enable ? [x.label] : []) as Filter[]
    messages.push({
      id: `${Date.now()}`,
      role: 'user',
      parts: [{
        type: 'text',
        text: JSON.stringify(currentFilters),
      }],
    })
  }

  const startTime = Date.now()

  const stream = createUIMessageStream({
    execute({ writer }) {
      const result = streamText({
        model: provider(model),
        system: CHAT_SYSTEM_PROMPT,
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        activeTools: ['find_filter', 'find_job'],
        providerOptions: { google: {} },
        tools,
        stopWhen: [
          stepCountIs(1),
          hasToolCall('find_job'),
          hasToolCall('find_filter'),
        ],
      })

      result.consumeStream()

      const uiStream = result.toUIMessageStream({
        messageMetadata({ part }): Metadata | undefined {
          if (part.type === 'finish-step') {
            return {
              model: part.response.modelId.replaceAll('-', ' '),
            }
          }

          if (part.type === 'finish') {
            return {
              totalTokens: part.totalUsage?.totalTokens,
              inputTokens: part.totalUsage?.inputTokens,
              outputTokens: part.totalUsage?.outputTokens,
              duration: (Date.now() - startTime) / 1000,
              finishReason: part.finishReason,
            }
          }

          return undefined
        },
      })

      writer.merge(uiStream)
    },

    // eslint-disable-next-line unused-imports/no-unused-vars
    async onFinish({ messages }) {
    },
  })

  return createUIMessageStreamResponse({ stream })
})
