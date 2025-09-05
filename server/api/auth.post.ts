import { z } from 'zod'
import { UsernameSchema } from '~~/shared/schemas'
import { db, tables } from '../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { username } = await readValidatedBody(
    event,
    z.object({ username: UsernameSchema }).parse,
  )

  const users = await db.insert(tables.users)
    .values({ id: session.id, username })
    .onConflictDoNothing({ target: tables.users.id })
    .returning()

  await setUserSession(event, { user: users[0] })
})
