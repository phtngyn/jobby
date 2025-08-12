import type { UIMessage } from 'ai'
import type { ChatConfig, Job, Metadata } from '~~/shared/types'
import { CHAT_CONFIG_COOKIE, MODELS } from '#shared/constants'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
} from 'ai'
import { destr } from 'destr'
import { provider } from '../ai/llm'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{
    messages: UIMessage[]
    jobs?: Job[]
  }>(event)

  const config = destr<ChatConfig>(getCookie(event, CHAT_CONFIG_COOKIE))

  const model = config.model && MODELS.find(m => m.key === config.model)
    ? config.model
    : MODELS[0]!.key

  const startTime = Date.now()

  const stream = createUIMessageStream({
    execute({ writer }) {
      const result = streamText({
        model: provider(model),
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        providerOptions: { google: {} },
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
