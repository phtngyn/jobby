import process from 'node:process'
import { z } from 'zod/v4'

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production'])
    .default('development'),

  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
})

export type Env = z.infer<typeof schema>

export const env = schema.parse(process.env)
