import type { ChatUIMessage, FactualMemory, Session } from '~~/shared/types'
import { convertToModelMessages, generateObject } from 'ai'
import { eq } from 'drizzle-orm'
import { JOB_WORKINGTIMES, LIGHT_MODEL } from '~~/shared/constants'
import { FactualMemorySchema } from '~~/shared/schemas'
import { provider } from '../ai/llm'
import { db } from './drizzle'

export async function getFactualMemory() {

}

export async function saveFactualMemory(session: Session, messages: ChatUIMessage[]) {
  const system = [
    'You are an extractor that converts user job preferences into structured data.',
    'Always output a JSON object that strictly follows the provided schema.',
    'Rules:',
    '- Only extract explicit information from the conversation.',
    '- If the user confirms or agrees with the assistant\'s suggestion, extract those values as explicit preferences.',
    '- If a statement can be mapped to filters, map it there.',
    '- If it cannot be mapped, put it in "others".',
    '- Keep values concise and aligned with the enums.',
    '- Always return a valid object, even if empty.',
  ].join('\n')

  const context = convertToModelMessages(messages.slice(-5))
    .filter(m => m.role !== 'tool')

  const { object } = await generateObject({
    model: provider(LIGHT_MODEL),
    schema: FactualMemorySchema,
    output: 'object',
    system,
    messages: context,
  })

  if (!object.filters && !object.others?.length)
    return

  if (object.filters?.workingtimes?.length) {
    const times = object.filters.workingtimes.flatMap(x => Number.isInteger(x) ? [x] : [])
    object.filters.workingtimes = (() => {
      if (times.length === 1)
        return [times[0], JOB_WORKINGTIMES.max]

      return times
    })()
  }

  const old = await db.query.factualMemories.findFirst({
    where: eq(tables.factualMemories.userId, session.id),
  })

  const data = merge(object, old?.data)

  await db.insert(tables.factualMemories)
    .values({ userId: session.id, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: tables.factualMemories.userId,
      set: { data, updatedAt: new Date() },
    })
}

type FactualMemoryFiltersKey = keyof NonNullable<FactualMemory['filters']>
function merge(l: FactualMemory, r?: FactualMemory): FactualMemory {
  if (!r)
    return l

  const filters: FactualMemory['filters'] = {}

  const keys = new Set<FactualMemoryFiltersKey>([
    ...(Object.keys(l.filters ?? {}) as FactualMemoryFiltersKey[]),
    ...(Object.keys(r.filters ?? {}) as FactualMemoryFiltersKey[]),
  ])

  for (const key of keys) {
    const left = l.filters?.[key] ?? []
    const right = r.filters?.[key] ?? []
    filters[key] = [...new Set([...left, ...right]) as any]
  }

  const seen = new Set<string>()
  const others = [...(l.others ?? []), ...(r.others ?? [])]
    .filter(
      (item) => {
        const key = JSON.stringify(item)
        if (seen.has(key))
          return false
        seen.add(key)
        return true
      },
    )

  return { filters, others }
}
