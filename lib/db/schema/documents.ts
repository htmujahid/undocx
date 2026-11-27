import { relations } from "drizzle-orm";
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { BriefAnswers, BriefQuestion, OutlineAdvice } from "../../documents/brief";
import { newId } from "../../id";
import { user } from "./auth";
import { ruleSet, voice, writerProfile } from "./context";

export const documentStatus = pgEnum("document_status", ["drafting", "draft", "ready"]);

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
    profileId: text().references(() => writerProfile.id, { onDelete: "set null" }),
    voiceId: text().references(() => voice.id, { onDelete: "set null" }),
    ruleSetId: text().references(() => ruleSet.id, { onDelete: "set null" }),
    content: jsonb(),
    contentVersion: integer().notNull().default(0),
    plainText: text().notNull().default(""),
    wordCount: integer().notNull().default(0),
    lockedCount: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("document_user_updated_idx").on(table.userId, table.updatedAt)],
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

export const documentRelations = relations(document, ({ one }) => ({
  brief: one(documentBrief, { fields: [document.id], references: [documentBrief.documentId] }),
  user: one(user, { fields: [document.userId], references: [user.id] }),
  profile: one(writerProfile, { fields: [document.profileId], references: [writerProfile.id] }),
  voice: one(voice, { fields: [document.voiceId], references: [voice.id] }),
  ruleSet: one(ruleSet, { fields: [document.ruleSetId], references: [ruleSet.id] }),
}));
