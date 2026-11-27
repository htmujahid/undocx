import { relations } from "drizzle-orm";
import { index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { newId } from "../../id";
import { user } from "./auth";
import { document } from "./documents";

export const asset = pgTable(
  "asset",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text().notNull(),
    filename: text().notNull(),
    mimeType: text().notNull(),
    size: integer().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("asset_user_idx").on(table.userId), uniqueIndex("asset_key_idx").on(table.key)],
);

export const source = pgTable(
  "source",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text().$type<"file" | "text" | "link">().notNull(),
    title: text().notNull(),
    url: text(),
    assetId: text().references(() => asset.id, { onDelete: "set null" }),
    content: text().notNull().default(""),
    wordCount: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("source_user_idx").on(table.userId, table.updatedAt)],
);

export const documentSource = pgTable(
  "document_source",
  {
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    sourceId: text()
      .notNull()
      .references(() => source.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.documentId, table.sourceId] }), index("document_source_source_idx").on(table.sourceId)],
);

export const note = pgTable(
  "note",
  {
    id: text().primaryKey().$defaultFn(newId),
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    markId: text().notNull(),
    quote: text(),
    text: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("note_document_mark_idx").on(table.documentId, table.markId)],
);

export const sourceRelations = relations(source, ({ one, many }) => ({
  asset: one(asset, { fields: [source.assetId], references: [asset.id] }),
  documents: many(documentSource),
}));

export const documentSourceRelations = relations(documentSource, ({ one }) => ({
  document: one(document, { fields: [documentSource.documentId], references: [document.id] }),
  source: one(source, { fields: [documentSource.sourceId], references: [source.id] }),
}));
