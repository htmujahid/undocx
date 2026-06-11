import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { artifactCollection } from "./artifact-schema"
import { workspace } from "./workspace-schema"

export const collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    color: text("color").notNull().default("#6366f1"),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("collection_workspaceId_idx").on(table.workspaceId)]
)

export const collectionRelations = relations(collection, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [collection.workspaceId],
    references: [workspace.id],
  }),
  artifactCollections: many(artifactCollection),
}))
