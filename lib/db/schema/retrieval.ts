import { sql } from "drizzle-orm";
import { customType, halfvec, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { newId } from "../../id";
import { user } from "./auth";
import { document } from "./documents";

export const embeddingDimensions = 1536;

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const documentChunk = pgTable(
  "document_chunk",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    blockStart: integer().notNull(),
    blockEnd: integer().notNull(),
    headingPath: text().notNull().default(""),
    text: text().notNull(),
    contentHash: text().notNull(),
    embedding: halfvec({ dimensions: embeddingDimensions }).notNull(),
    embeddingModel: text().notNull(),
    tsv: tsvector().generatedAlwaysAs(sql`to_tsvector('english', "text")`),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("document_chunk_user_idx").on(table.userId),
    uniqueIndex("document_chunk_position_idx").on(table.documentId, table.position),
    index("document_chunk_tsv_idx").using("gin", table.tsv),
  ],
);

export const indexJob = pgTable(
  "index_job",
  {
    documentId: text()
      .primaryKey()
      .references(() => document.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    requestedAt: timestamp().defaultNow().notNull(),
    lockedAt: timestamp(),
    attempts: integer().notNull().default(0),
    error: text(),
  },
  (table) => [index("index_job_requested_idx").on(table.requestedAt)],
);

export const chatThread = pgTable(
  "chat_thread",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("chat_thread_user_updated_idx").on(table.userId, table.updatedAt)],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text().primaryKey().$defaultFn(newId),
    threadId: text()
      .notNull()
      .references(() => chatThread.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    role: text().notNull(),
    parts: jsonb().notNull(),
    metadata: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("chat_message_thread_idx").on(table.threadId, table.position)],
);
