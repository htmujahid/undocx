import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { newId } from "../../id";
import { user } from "./auth";

export const ruleKind = pgEnum("rule_kind", ["spelling", "banned_word", "format", "custom"]);

const stamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const writerProfile = pgTable(
  "writer_profile",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    role: text().notNull().default(""),
    organization: text().notNull().default(""),
    industry: text().notNull().default(""),
    about: text().notNull().default(""),
    region: text(),
    firstLanguage: text(),
    writingLanguage: text(),
    currency: text(),
    units: text(),
    dateFormat: text(),
    audience: text().notNull().default(""),
    audienceLevel: text(),
    facts: text().notNull().default(""),
    signoff: text().notNull().default(""),
    contact: text().notNull().default(""),
    isDefault: boolean().notNull().default(false),
    ...stamps,
  },
  (table) => [index("writer_profile_user_idx").on(table.userId), uniqueIndex("writer_profile_default_idx").on(table.userId).where(sql`${table.isDefault}`)],
);

export const voice = pgTable(
  "voice",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    notes: text().notNull().default(""),
    summary: jsonb(),
    summarizedAt: timestamp(),
    ...stamps,
  },
  (table) => [index("voice_user_idx").on(table.userId)],
);

export const voiceSample = pgTable(
  "voice_sample",
  {
    id: text().primaryKey().$defaultFn(newId),
    voiceId: text()
      .notNull()
      .references(() => voice.id, { onDelete: "cascade" }),
    title: text().notNull(),
    content: text().notNull(),
    wordCount: integer().notNull(),
    isIncluded: boolean().notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("voice_sample_voice_idx").on(table.voiceId)],
);

export const ruleSet = pgTable(
  "rule_set",
  {
    id: text().primaryKey().$defaultFn(newId),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    description: text().notNull().default(""),
    ...stamps,
  },
  (table) => [index("rule_set_user_idx").on(table.userId)],
);

export const rule = pgTable(
  "rule",
  {
    id: text().primaryKey().$defaultFn(newId),
    ruleSetId: text()
      .notNull()
      .references(() => ruleSet.id, { onDelete: "cascade" }),
    kind: ruleKind().notNull(),
    value: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("rule_rule_set_idx").on(table.ruleSetId), uniqueIndex("rule_spelling_idx").on(table.ruleSetId).where(sql`${table.kind} = 'spelling'`)],
);

export const voiceRelations = relations(voice, ({ many }) => ({ samples: many(voiceSample) }));
export const voiceSampleRelations = relations(voiceSample, ({ one }) => ({ voice: one(voice, { fields: [voiceSample.voiceId], references: [voice.id] }) }));
export const ruleSetRelations = relations(ruleSet, ({ many }) => ({ rules: many(rule) }));
export const ruleRelations = relations(rule, ({ one }) => ({ ruleSet: one(ruleSet, { fields: [rule.ruleSetId], references: [ruleSet.id] }) }));
