import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed as _embed } from 'ai'
import { env } from '../../configs/env'

export const provider = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function embed(value: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY') {
  const { embedding } = await _embed({
    model: provider.textEmbeddingModel('text-embedding-004'),
    value,
    providerOptions: {
      google: {
        outputDimensionality: 768,
        taskType,
      },
    },
  })
  return embedding
}
