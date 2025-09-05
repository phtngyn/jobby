import type { ChatMetadata, ChatUIMessagePart } from '~~/shared/types'
import { relations } from 'drizzle-orm'
import { index, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar, vector } from 'drizzle-orm/pg-core'

export const MessageRoleEnum = pgEnum('role', ['user', 'assistant', 'system'])

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: varchar('username', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
)

export const threads = pgTable(
  'threads',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar({ length: 200 }).notNull().default('Untitled'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('threads_user_id_idx').on(table.userId),
  ],
)

export const messages = pgTable(
  'messages',
  {
    id: varchar({ length: 36 }).primaryKey(),
    threadId: varchar({ length: 36 }).notNull().references(() => threads.id, { onDelete: 'cascade' }),
    role: MessageRoleEnum('role').notNull(),
    metadata: jsonb('metadata').$type<ChatMetadata>().notNull().default({}),
    parts: jsonb('parts').$type<ChatUIMessagePart[]>().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('messages_thread_id_idx').on(table.threadId),
    index('messages_created_at_idx').on(table.createdAt),
  ],
)

export const memories = pgTable(
  'memories',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1024 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
)

export const usersRelations = relations(
  users,
  ({ many }) => ({
    threads: many(threads),
  }),
)

export const threadsRelations = relations(
  threads,
  ({ one, many }) => ({
    user: one(users, {
      fields: [threads.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
)

export const messagesRelations = relations(
  messages,
  ({ one }) => ({
    thread: one(threads, {
      fields: [messages.threadId],
      references: [threads.id],
    }),
  }),
)

export const memoriesRelations = relations(
  memories,
  ({ one }) => ({
    user: one(users, {
      fields: [memories.userId],
      references: [users.id],
    }),
  }),
)
