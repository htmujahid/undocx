import { relations } from "drizzle-orm"
import { AnyPgColumn, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { artifactFolder } from "./artifact-schema"
import { workspace } from "./workspace-schema"

export const folder = pgTable(
  "folder",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => folder.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("folder_workspaceId_idx").on(table.workspaceId),
    index("folder_parentId_idx").on(table.parentId),
  ]
)

export const folderRelations = relations(folder, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [folder.workspaceId],
    references: [workspace.id],
  }),
  parent: one(folder, {
    fields: [folder.parentId],
    references: [folder.id],
    relationName: "parent_children",
  }),
  children: many(folder, { relationName: "parent_children" }),
  artifactFolders: many(artifactFolder),
}))
