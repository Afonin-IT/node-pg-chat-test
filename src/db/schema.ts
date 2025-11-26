import { integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const messageTypeEnum = pgEnum('message_type', ['TEXT', 'FILE']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  type: messageTypeEnum('type').notNull(),
  content: text('content').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));
