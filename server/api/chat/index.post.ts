/* eslint-disable unused-imports/no-unused-vars */
import type { Tool } from 'ai'
import type { ChatToolKeys, ChatUIMessage } from '~~/shared/types'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, smoothStream, streamText } from 'ai'
import { z } from 'zod'
import { provider } from '~~/server/ai/llm'
import { getToolbox } from '~~/server/ai/tools'
import { getConfig, getText } from '~~/server/utils/chat'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const body = await readValidatedBody(
    event,
    z.object({
      messages: z.array(z.custom<ChatUIMessage>()),
      jobs: z.array(JobSchema).optional(),
    }).parse,
  )

  const { model, filters } = getConfig(event)
  const startTime = Date.now()

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: body.messages,
    async execute({ writer }) {
      const query = getText(body.messages.at(-1)!)

      const modelMessages = convertToModelMessages(body.messages)

      const result = streamText({
        model: provider(model),
        messages: modelMessages,
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: (() => {
          const toolbox = getToolbox(writer)

          const tools: Partial<Record<ChatToolKeys, Tool>> = {
            get_jobs: toolbox.get_jobs(),
            get_filters: toolbox.get_filters(filters),
          }

          if (body.jobs?.length) {
            tools.get_similar_jobs = toolbox.get_similar_jobs({ jobs: body.jobs })
            tools.analyze_jobs = toolbox.analyze_jobs({ jobs: body.jobs })
          }
          return tools
        })(),
      })

      writer.merge(
        result.toUIMessageStream<ChatUIMessage>({
          sendStart: false,
          messageMetadata({ part }) {
            switch (part.type) {
              case 'finish-step':{
                return { stats: { model: part.response.modelId } }
              }
              case 'finish':{
                return {
                  stats: {
                    totalTokens: part.totalUsage?.totalTokens,
                    inputTokens: part.totalUsage?.inputTokens,
                    outputTokens: part.totalUsage?.outputTokens,
                    duration: (Date.now() - startTime) / 1000,
                    finishReason: part.finishReason,
                  },
                }
              }
            }
          },
        }),
      )
    },
    onError(error) {
      return error instanceof Error ? error.message : String(error)
    },
    async onFinish({ messages }) {
      // await saveMessages(session, messages)
    },
  })

  return createUIMessageStreamResponse({ stream })
})
