import { eq } from 'drizzle-orm'
import { db } from '../utils/drizzle'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const user = await db.query.users.findFirst({
    where: eq(tables.users.id, session.id),
  })

  if (!user)
    await clearUserSession(event)
})
