import { asc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const threads = await db.query.threads.findMany({
    where: eq(tables.threads.userId, session.id),
    with: {
      messages: {
        orderBy: asc(tables.messages.createdAt),
      },
    },
  })

  let thread: typeof threads[number] | undefined

  if (threads.length) {
    thread = threads[0]!
  }
  else {
    const result = await db.insert(tables.threads)
      .values({ userId: session.id })
      .returning()
    thread = { ...result[0], messages: [] }
  }

  return { threads, thread }
})
