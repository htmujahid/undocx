import { relations, sql } from "drizzle-orm";
import { index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { BriefAnswers, BriefQuestion, OutlineAdvice } from "../../documents/brief";
import { newId } from "../../id";
import { user } from "./auth";
import { ruleSet, voice, writerProfile } from "./context";

export const documentStatus = pgEnum("document_status", ["drafting", "draft", "ready"]);

export const folder = pgTable(
  "folder",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("folder_user_name_idx").on(table.userId, sql`lower(${table.name})`)],
);

export const tag = pgTable(
  "tag",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tag_user_name_idx").on(table.userId, sql`lower(${table.name})`)],
);

export const document = pgTable(
  "document",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text().notNull().default("Untitled document"),
    type: text(),
    status: documentStatus().notNull().default("draft"),
    folderId: text().references(() => folder.id, { onDelete: "set null" }),
    profileId: text().references(() => writerProfile.id, { onDelete: "set null" }),
    voiceId: text().references(() => voice.id, { onDelete: "set null" }),
    ruleSetId: text().references(() => ruleSet.id, { onDelete: "set null" }),
    content: jsonb(),
    contentVersion: integer().notNull().default(0),
    indexedVersion: integer(),
    indexedHash: text(),
    indexedAt: timestamp(),
    plainText: text().notNull().default(""),
    wordCount: integer().notNull().default(0),
    lockedCount: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("document_user_updated_idx").on(table.userId, table.updatedAt), index("document_folder_idx").on(table.folderId)],
);

export const documentTag = pgTable(
  "document_tag",
  {
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    tagId: text()
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.documentId, table.tagId] }), index("document_tag_tag_idx").on(table.tagId)],
);

export const documentBrief = pgTable("document_brief", {
  documentId: text()
    .primaryKey()
    .references(() => document.id, { onDelete: "cascade" }),
  prompt: text().notNull(),
  outline: text().notNull().default("auto"),
  questions: jsonb().$type<BriefQuestion[]>().notNull().default([]),
  answers: jsonb().$type<BriefAnswers>().notNull().default({}),
  advice: jsonb().$type<OutlineAdvice>(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const documentVersion = pgTable(
  "document_version",
  {
    id: text().primaryKey().$defaultFn(newId),
    documentId: text()
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    number: integer().notNull(),
    name: text(),
    kind: text().$type<"manual" | "ai" | "restore">().notNull(),
    label: text(),
    content: jsonb().notNull(),
    wordCount: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("document_version_number_idx").on(table.documentId, table.number)],
);

export const documentRelations = relations(document, ({ one }) => ({
  brief: one(documentBrief, { fields: [document.id], references: [documentBrief.documentId] }),
  user: one(user, { fields: [document.userId], references: [user.id] }),
  profile: one(writerProfile, { fields: [document.profileId], references: [writerProfile.id] }),
  voice: one(voice, { fields: [document.voiceId], references: [voice.id] }),
  ruleSet: one(ruleSet, { fields: [document.ruleSetId], references: [ruleSet.id] }),
}));
