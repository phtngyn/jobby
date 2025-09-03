import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { input } = await readValidatedBody(
    event,
    z.object({ input: z.string().trim().nonempty() }).parse,
  )

  const object = await extractFilters({ prompt: input })

  return object
})
