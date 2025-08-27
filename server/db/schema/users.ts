import type { ChatUIMessage } from '~~/shared/types'
import { relations } from 'drizzle-orm'
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const MessageRoleEnum = pgEnum('role', [
  'user',
  'assistant',
  'system',
])

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: varchar('username', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
)

export const chats = pgTable(
  'chats',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    messages: jsonb('messages').$type<ChatUIMessage[]>().notNull().default([]),
  },
  table => [
    index('chats_user_id_idx').on(table.userId),
    uniqueIndex('chats_user_id_unique').on(table.userId),
  ],
)

export const usersRelations = relations(users, ({ one }) => ({
  chat: one(chats, {
    fields: [users.id],
    references: [chats.userId],
  }),
}))

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
}))
