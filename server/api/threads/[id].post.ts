import type { Tool } from 'ai'
import type { ChatToolKeys, ChatUIMessage } from '~~/shared/types'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, smoothStream, streamText } from 'ai'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { provider } from '~~/server/ai/llm'
import { getToolbox } from '~~/server/ai/tools'
import { generateTitle, getConfig } from '~~/server/utils/chat'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: z.string() }).parse,
  )

  const where = and(eq(tables.threads.id, params.id), eq(tables.threads.userId, session.id))
  const thread = await db.query.threads.findFirst({ where })

  if (!thread) {
    throw createError({ statusCode: 404, statusMessage: 'Thread not found' })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      messages: z.array(z.custom<ChatUIMessage>()).nonempty(),
      jobs: z.array(JobSchema).optional(),
    }).parse,
  )

  if (!thread.title || thread.title === 'Untitled') {
    const message = body.messages[0]
    const title = await generateTitle(message)
    await db.update(tables.threads).set({ title }).where(where)
  }

  const { model } = getConfig(event)
  const startTime = Date.now()

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: body.messages,
    async execute({ writer }) {
      const result = streamText({
        model: provider(model),
        messages: convertToModelMessages(body.messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: (() => {
          const toolbox = getToolbox(writer)

          const tools: Partial<Record<ChatToolKeys, Tool>> = {
            get_jobs: toolbox.get_jobs(),
          }

          if (body.jobs?.length) {
            tools.get_similar_jobs = toolbox.get_similar_jobs({ jobs: body.jobs })
            tools.analyze_jobs = toolbox.analyze_jobs({ jobs: body.jobs })
          }
          return tools
        })(),
      })

      // result.consumeStream()

      writer.merge(
        result.toUIMessageStream<ChatUIMessage>({
          sendStart: false,
          sendReasoning: false,
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
      saveMessages(params.id, messages)
    },
  })

  return createUIMessageStreamResponse({ stream })
})
