import type { Tool } from 'ai'
import type { ChatDataPart, ChatToolKeys, ChatUIMessage, ChatWriter } from '~~/shared/types'
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
import { getToolbox } from '~~/server/ai/tools'
import { getConfig, getText } from '~~/server/utils/chat'
import { LIGHT_MODEL } from '~~/shared/constants'
import { ChatDataPartClassificationSchema, ExtractionSchema, JobSchema } from '~~/shared/schemas'

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

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: messages,
    async execute({ writer }) {
      const query = getText(messages.at(-1)!)

      const classification = await classify(writer, { query, jobs: !!jobs?.length })

      const result = streamText({
        model: provider(model),
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        activeTools: (() => {
          if (classification.type && classification.type !== 'general')
            return [classification.type]

          return []
        })(),
        tools: (() => {
          const toolbox = getToolbox(writer)

          const tools: Partial<Record<ChatToolKeys, Tool>> = {
            get_jobs: toolbox.get_jobs(),
            get_filters: toolbox.get_filters(filters),
          }

          if (jobs?.length) {
            tools.get_similar_jobs = toolbox.get_similar_jobs({ jobs })
            tools.analyze_jobs = toolbox.analyze_jobs({ jobs })
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
      const idx = messages.findLastIndex(m => m.role === 'user')

      if (idx === -1)
        return

      const user = getText(messages[idx]!)
      const assistant = messages[idx - 1] ? getText(messages[idx - 1]) : undefined

      const system = [
        'Extract user profile and preferences from a single user message.',
        'Return only explicit information; do not infer.',
        'Keep values concise. If a field is not stated, omit it.',
        'If hours per week are mentioned, set preferences.hours_per_week.min/max accordingly.',
        assistant ? `Last assistant message:\n${assistant}` : undefined,
      ]
        .filter(Boolean)
        .join('\n')

      const { object } = await generateObject({
        model: provider(LIGHT_MODEL),
        schema: ExtractionSchema,
        output: 'object',
        system,
        prompt: `Current user message:\n${user}`,
      })

      console.dir({ user, assistant, object }, { depth: null })
    },
  })

  return createUIMessageStreamResponse({ stream })
})

async function classify(
  writer: ChatWriter,
  params: { query: string, jobs: boolean },
) {
  const id = generateId()

  writer.write({
    id,
    type: 'data-classification',
    data: {
      type: 'general',
      confidence: 0,
      reason: '',
      status: 'loading',
    },
  })

  const systemPrompt = `
You are a routing classifier for a job search assistant.
Classify the following user query for routing to the correct agent/tool.

Definitions:
- "general": Career advice, job search strategy, resume tips, interview prep, etc.
- "get_jobs": Requests to find jobs in the database, often mentioning roles, locations, or industries.
- "get_filters": Requests to adjust filters for an existing job search, such as location, salary, job type, or remote preference.
  IMPORTANT: Only classify as get_filters if the intent is clear and unambiguous.
- "analyze_jobs": The user uploaded job descriptions and is asking questions about them (e.g., compare, analyze, summarize).
- "get_similar_jobs": The user uploaded jobs and wants to find similar jobs in the database.

Examples:
Q: "How do I prepare for a product manager interview?"
A: { "type": "general", "reason": "This is about interview prep, not searching jobs.", "confidence": 0.95 }

Q: "Find me software engineer jobs in New York"
A: { "type": "get_jobs", "reason": "This is a request to search the job database.", "confidence": 0.98 }

Q: "Only show me remote jobs"
A: { "type": "get_filters", "reason": "This is a clear request to adjust the job search filter.", "confidence": 0.99 }

Q: "I think remote jobs are better"
A: { "type": "general", "reason": "This is an opinion, not a filter update instruction.", "confidence": 0.9 }

Q: "Which of the uploaded jobs is best for a new graduate?"
A: { "type": "analyze_jobs", "reason": "The user is asking about uploaded jobs.", "confidence": 0.96 }

Q: "Find me similar jobs to the ones I uploaded"
A: { "type": "get_similar_jobs", "reason": "The user wants to search the database using uploaded jobs as reference.", "confidence": 0.97 }
`

  let object: Omit<ChatDataPart['classification'], 'status'> = {
    type: 'general',
    confidence: 0,
    reason: '',
  }

  try {
    const { object: _object } = await generateObject({
      model: provider(LIGHT_MODEL),
      schema: ChatDataPartClassificationSchema.omit({ status: true }),
      output: 'object',
      system: systemPrompt,
      prompt: `User query:\n${params.query}`,
    })
    object = _object
  }
  catch (error) {
    console.error(error)
  }

  if (object.type === 'get_filters' && object.confidence < 0.85) {
    object.type = 'general'
    object.reason = `Ambiguous filter update request, downgraded to general for safety.\nOld: ${object.reason}`
  }

  if (params.jobs) {
    if (object.type === 'get_jobs') {
      object.type = 'get_similar_jobs'
      object.reason = `User uploaded jobs, so this is a search based on uploaded jobs.\nOld: ${object.reason}`
    }
    else if (object.type === 'general') {
      object.type = 'analyze_jobs'
      object.reason = `User uploaded jobs, so this is about uploaded job documents.\nOld: ${object.reason}`
    }
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
