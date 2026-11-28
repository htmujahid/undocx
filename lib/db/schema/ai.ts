import { relations } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { newId } from "../../id";
import { user } from "./auth";
import { document } from "./documents";

export const aiThread = pgTable(
  "ai_thread",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("ai_thread_document_idx").on(table.documentId)],
);

export const aiMessage = pgTable(
  "ai_message",
  {
    id: text().primaryKey().$defaultFn(newId),
    threadId: text()
      .notNull()
      .references(() => aiThread.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    role: text().notNull(),
    parts: jsonb().notNull(),
    metadata: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("ai_message_thread_idx").on(table.threadId, table.position)],
);

export const aiRun = pgTable(
  "ai_run",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentId: text().references(() => document.id, { onDelete: "set null" }),
    threadId: text().references(() => aiThread.id, { onDelete: "set null" }),
    kind: text().notNull(),
    model: text().notNull(),
    status: text().notNull(),
    finishReason: text(),
    error: text(),
    inputTokens: integer().notNull().default(0),
    outputTokens: integer().notNull().default(0),
    totalTokens: integer().notNull().default(0),
    costMicros: integer().notNull().default(0),
    durationMs: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("ai_run_user_created_idx").on(table.userId, table.createdAt)],
);

export const aiThreadRelations = relations(aiThread, ({ one, many }) => ({
  document: one(document, { fields: [aiThread.documentId], references: [document.id] }),
  messages: many(aiMessage),
}));

export const aiMessageRelations = relations(aiMessage, ({ one }) => ({
  thread: one(aiThread, { fields: [aiMessage.threadId], references: [aiThread.id] }),
}));
