import type { EmbeddingConfig } from '~~/shared/types'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed as _embed, embedMany as _embedMany } from 'ai'
import { JOB_CHUNK_EMBEDDING_OUTPUT } from '~~/shared/constants'
import { env } from '../../configs/env'

export const provider = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function embed(
  value: string,
  config: EmbeddingConfig = {},
) {
  const providerOptions = getProviderOptions(config)

  const { embedding } = await _embed({
    model: provider.textEmbedding('gemini-embedding-001'),
    value,
    providerOptions,
  })
  return embedding
}

export async function embedMany(
  values: string[],
  config: EmbeddingConfig = {},
) {
  const providerOptions = getProviderOptions(config)

  const { embeddings } = await _embedMany({
    model: provider.textEmbedding('gemini-embedding-001'),
    values,
    providerOptions,
  })
  return embeddings
}

function getProviderOptions(config: EmbeddingConfig) {
  const { type = 'RETRIEVAL_QUERY' } = config

  return {
    google: {
      taskType: type,
      outputDimensionality: JOB_CHUNK_EMBEDDING_OUTPUT,
    },
  }
}
