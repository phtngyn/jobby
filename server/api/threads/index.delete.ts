import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const body = await readValidatedBody(
    event,
    z.object({ id: z.string() }).parse,
  )

  const threads = await db.delete(tables.threads).where(and(
    eq(tables.threads.id, body.id),
    eq(tables.threads.userId, session.id),
  )).returning()

  return threads
})
