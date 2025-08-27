import type { UserSession, UserSessionRequired } from '#auth-utils'
import type { H3Event } from 'h3'
import type { ChatConfig, ChatUIMessage } from '~~/shared/types'
import { destr } from 'destr'
import { eq } from 'drizzle-orm'
import { CHAT_CONFIG_COOKIE, MODELS } from '~~/shared/constants'
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

export async function getChat(session: UserSessionRequired | UserSession) {
  const chat = await db.query.chats.findFirst({
    where: eq(tables.chats.userId, session.id),
  })

  return chat
}

export async function saveMessages(session: UserSessionRequired | UserSession, messages: ChatUIMessage[]) {
  await db
    .update(tables.chats)
    .set({ messages })
    .where(eq(tables.chats.userId, session.id))
}
