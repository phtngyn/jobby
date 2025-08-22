import type { H3Event } from 'h3'
import type { ChatConfig } from '~~/shared/types'
import { destr } from 'destr'
import { CHAT_CONFIG_COOKIE, MODELS } from '~~/shared/constants'

export function getConfig(event: H3Event) {
  const config = destr<ChatConfig>(getCookie(event, CHAT_CONFIG_COOKIE))

  const model = config.model && MODELS.find(m => m.key === config.model)
    ? config.model
    : MODELS[0]!.key

  return { ...config, model }
}
