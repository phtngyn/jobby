import type { H3Event } from 'h3'
import type { ChatConfig, ChatUIMessage } from '~~/shared/types'
import { destr } from 'destr'
import { CHAT_CONFIG_COOKIE, MODELS } from '~~/shared/constants'

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
