import { auth } from '~~/db/auth'

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
