import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { UsernameSchema } from '~~/shared/schemas'
import { db, tables } from '../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  let user = await db.query.users.findFirst({
    where: eq(tables.users.id, session.id),
  })

  if (!user) {
    const { username } = await readValidatedBody(
      event,
      z.object({ username: UsernameSchema }).parse,
    )

    const users = await db.insert(tables.users)
      .values({ id: session.id, username })
      .returning()

    user = users[0]
  }

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create or fetch user',
    })
  }

  await db.insert(tables.chats)
    .values({ userId: user.id })
    .onConflictDoNothing()

  await setUserSession(event, { user })
})
