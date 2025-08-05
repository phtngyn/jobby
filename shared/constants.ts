import type { Model, ModelKey } from './types'

export const MODELS: Model[] = [
  { key: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', company: 'Google' },
  { key: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', company: 'Google' },
  { key: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', company: 'Google' },
]
export const LIGHT_MODEL_KEY: ModelKey = MODELS[0]!.key

export const CHAT_CONFIG_COOKIE = 'chat-config'
export const DEFAULT_CHAT_CONFIG = { model: LIGHT_MODEL_KEY, search: false }
