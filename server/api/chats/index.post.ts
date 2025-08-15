import type { UIMessage } from 'ai'
import type { Job, Metadata } from '~~/shared/types'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
} from 'ai'
import { provider } from '~~/server/ai/llm'
import { getConfig } from '~~/server/uitls/chat'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{
    messages: UIMessage[]
    jobs?: Job[]
  }>(event)

  const { model } = getConfig(event)
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
              model: part.response.modelId,
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
