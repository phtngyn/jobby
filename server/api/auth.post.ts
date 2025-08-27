import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId')

  if (userId) {
    // db get user
  }
  else {
    const session = await getUserSession(event)
    const { username } = await readValidatedBody(
      event,
      z.object({ username: z.string().trim() }).parse,
    )
    const user = {
      id: session.id,
      shortId: session.id.split('-').at(-1),
      username,
    }

    await setUserSession(event, { user })
  }
})
