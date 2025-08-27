import { saveMessages } from '~~/server/utils/chat'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  await saveMessages(session, [])
})
