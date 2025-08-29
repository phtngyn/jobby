import type { H3Event } from 'h3'
import type { ChatConfig, ChatDataPart, ChatUIMessage, ChatWriter, Session } from '~~/shared/types'
import { generateId, generateObject } from 'ai'
import { destr } from 'destr'
import { eq } from 'drizzle-orm'
import { CHAT_CONFIG_COOKIE, LIGHT_MODEL, MODELS } from '~~/shared/constants'
import { ChatDataPartClassificationSchema } from '~~/shared/schemas'
import { provider } from '../ai/llm'
import { db } from './drizzle'

export function getConfig(event: H3Event) {
  const config = destr<ChatConfig | undefined>(getCookie(event, CHAT_CONFIG_COOKIE))

  const model = config?.model && MODELS.find(m => m.key === config.model)
    ? config.model
    : MODELS[0]!.key

  const filters = config?.filters ?? {}

  return { model, filters }
}

export function getText(message: ChatUIMessage) {
  return message.parts.flatMap(p => p.type === 'text' ? [p.text.trim()] : []).join('')
}

export async function getChat(session: Session) {
  const chat = await db.query.chats.findFirst({
    where: eq(tables.chats.userId, session.id),
  })

  return chat
}

export async function saveMessages(session: Session, messages: ChatUIMessage[]) {
  await db
    .update(tables.chats)
    .set({ messages })
    .where(eq(tables.chats.userId, session.id))
}

export async function classify(writer: ChatWriter, params: { query: string, jobs: boolean }) {
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
