import { getChat } from '~~/server/utils/chat'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const chat = await getChat(session)
  return chat
})
