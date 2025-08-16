import type { AppUIMessage, Metadata } from '~~/shared/types'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
} from 'ai'
import { z } from 'zod'
import { provider } from '~~/server/ai/llm'
import { get_job_tool } from '~~/server/ai/tools/jobs'
import { getConfig } from '~~/server/uitls/chat'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { messages, jobs } = await readValidatedBody(
    event,
    z.object({
      messages: z.array(z.custom<AppUIMessage>()),
      jobs: z.array(JobSchema).optional(),
    }).parse,
  )

  const _tools = {
    get_job: get_job_tool(jobs),
  }

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
