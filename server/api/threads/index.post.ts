export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const thread = await db.insert(tables.threads).values({
    userId: session.id,
  }).returning()

  return thread
})
