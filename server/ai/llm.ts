import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { env } from '../../configs/env'

export const provider = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function embed(value: string) {
  const embedding = await _embed(value)
  return embedding[0]
}

export async function embedMany(values: string[]) {
  return await _embed(values)
}

async function _embed(input: string | string[]) {
  const { embeddings } = await $fetch<{
    model: string
    embeddings: number[][]
  }>(
    'http://localhost:11434/api/embed',
    {
      method: 'POST',
      body: {
        model: 'jeffh/intfloat-multilingual-e5-large-instruct:q8_0',
        input,
      },
    },
  )
  return embeddings
}
