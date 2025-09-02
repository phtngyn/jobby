import type { ModelMessage } from 'ai'
import type { H3Event } from 'h3'
import type { ChatConfig, ChatUIMessage, Session } from '~~/shared/types'
import { generateObject } from 'ai'
import { destr } from 'destr'
import { eq } from 'drizzle-orm'
import { CHAT_CONFIG_COOKIE, JOB_WORKINGTIMES, LIGHT_MODEL, MODELS } from '~~/shared/constants'
import { FiltersSchema } from '~~/shared/schemas'
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

export async function extractFilters(messages: ModelMessage[]) {
  const system = `
You are an extractor that converts user job preferences into structured data.

Your task is to output a JSON object that strictly follows the provided schema.

Rules:
- Always return a valid JSON object, even if empty.
- Extract as many relevant values as possible for each property.
- Match user input to the closest values in the enums, even if the wording differs.
- If the user mentions multiple options, include all of them.
- If the user uses synonyms, paraphrases, or related terms, map them to the correct enum value.
  - Example: "remote work" → "100% Homeoffice"
  - Example: "consulting" → "IT Beratung, IT Consulting, IT Vertrieb"
  - Example: "banking" → "Banken, Finanzdienstleister, Versicherungen, Immobilien"
- For workingtimes:
  - If a single number is given, expand it to [value, 60].
  - If a range is given, keep it as [min, max].
  - Ignore vague mentions like "part-time" or "full-time" unless hours are explicitly stated.
- For types:
  - Only set a type if the user explicitly mentions one of the enum values
    (Festanstellung, Befristet, Freie Mitarbeit, Minijob).
  - Do not infer types from vague terms like "part-time", "temporary", or "short-term".
- If the user confirms or agrees with the assistant's suggestion, treat those values as explicit preferences.
- Do not invent values outside the enums. If no match exists, leave the property undefined.
- Be concise and consistent with the enums.

Goal:
Maximize the number of correct matches across all filter properties while staying strictly within the schema.
`

  const { object } = await generateObject({
    model: provider(LIGHT_MODEL),
    schema: FiltersSchema.omit({ search: true }),
    output: 'object',
    system,
    messages,
  })

  if (object?.workingtimes?.length) {
    const times = object.workingtimes.flatMap(x => Number.isInteger(x) ? [x] : [])
    object.workingtimes = (() => {
      if (times.length === 1)
        return [times[0], JOB_WORKINGTIMES.max]

      return times
    })()
  }

  return object
}

export async function saveMessages(session: Session, messages: ChatUIMessage[]) {
  await db
    .update(tables.chats)
    .set({ messages })
    .where(eq(tables.chats.userId, session.id))
}
