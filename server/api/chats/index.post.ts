import type { ChatToolKeys, ChatUIMessage, ChatWriter } from '~~/shared/types'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  generateObject,
  smoothStream,
  streamText,
} from 'ai'
import { z } from 'zod'
import { provider } from '~~/server/ai/llm'
import { getTools } from '~~/server/ai/tools'
import { getConfig } from '~~/server/utils/chat'
import { LIGHT_MODEL } from '~~/shared/constants'
import { ChatDataPartClassificationSchema, JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { messages, jobs } = await readValidatedBody(
    event,
    z.object({
      messages: z.array(z.custom<ChatUIMessage>()),
      jobs: z.array(JobSchema).optional(),
    }).parse,
  )

  const { model, filters } = getConfig(event)
  const startTime = Date.now()

  const lastMessage = messages.at(-1)!
  const query = lastMessage.parts.flatMap(p => p.type === 'text' ? [p.text] : []).join('')
  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: messages,
    async execute({ writer }) {
      const classification = await classify(writer, query)

      const tools = getTools(writer)

      const result = streamText({
        model: provider(model),
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        activeTools: (() => {
          const arr: ChatToolKeys[] = []

          if (classification.type === 'job_search')
            arr.push('get_jobs')

          if (classification.type === 'update_filters')
            arr.push('get_filters')

          return arr
        })(),
        tools: {
          get_jobs: tools.get_jobs({ jobs }),
          get_filters: tools.get_filters(filters),
        },
      })

      writer.merge(
        result.toUIMessageStream<ChatUIMessage>({
          sendStart: false,
          messageMetadata({ part }) {
            switch (part.type) {
              case 'finish-step':{
                return { model: part.response.modelId }
              }
              case 'finish':{
                return {
                  totalTokens: part.totalUsage?.totalTokens,
                  inputTokens: part.totalUsage?.inputTokens,
                  outputTokens: part.totalUsage?.outputTokens,
                  duration: (Date.now() - startTime) / 1000,
                  finishReason: part.finishReason,
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
    async onFinish({ responseMessage: _message }) {
      // Save to DB
    },
  })

  return createUIMessageStreamResponse({ stream })
})

async function classify(writer: ChatWriter, query: string) {
  const id = generateId()

  writer.write({
    id,
    type: 'data-classification',
    data: {
      type: 'general',
      confidence: 0,
      reasoning: '',
      status: 'loading',
    },
  })

  const prompt = `
You are a routing classifier for a job search assistant.
Classify the following user query for routing to the correct agent/tool.

Definitions:
- "general": Career advice, job search strategy, resume tips, interview prep, etc.
- "job_search": Requests to find jobs in the database, often mentioning roles, locations, or industries.
- "update_filters": Requests to adjust filters for an existing job search, such as location, salary, job type, or remote preference.
  IMPORTANT: Only classify as update_filters if the intent is clear and unambiguous.
  If there is any doubt, classify as general instead.

Examples:
Q: "How do I prepare for a product manager interview?"
A: { "type": "general", "reasoning": "This is about interview prep, not searching jobs.", "confidence": 0.95 }

Q: "Find me software engineer jobs in New York"
A: { "type": "job_search", "reasoning": "This is a request to search the job database.", "confidence": 0.98 }

Q: "Only show me remote jobs"
A: { "type": "update_filters", "reasoning": "This is a clear request to adjust the job search filter.", "confidence": 0.99 }

Q: "I think remote jobs are better"
A: { "type": "general", "reasoning": "This is an opinion, not a filter update instruction.", "confidence": 0.9 }

Now classify the following query:

User query:
${query}
`

  const { object } = await generateObject({
    model: provider(LIGHT_MODEL),
    schema: ChatDataPartClassificationSchema.omit({ status: true }),
    output: 'object',
    prompt,
  })

  if (object.type === 'update_filters' && object.confidence < 0.85) {
    object.type = 'general'
    object.reasoning = `Ambiguous filter update request, downgraded to general for safety.\nOld: ${object.reasoning}`
  }

  writer.write({
    id,
    type: 'data-classification',
    data: {
      ...object,
      status: 'done',
    },
  })

  return object
}
