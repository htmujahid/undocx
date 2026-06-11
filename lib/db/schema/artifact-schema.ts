import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { collection } from "./collection-schema"
import { folder } from "./folder-schema"
import { workspace } from "./workspace-schema"

export const artifact = pgTable(
  "artifact",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: jsonb("content"),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("artifact_workspaceId_idx").on(table.workspaceId)]
)

// An artifact can live in multiple folders at once (knowledge-base style)
export const artifactFolder = pgTable(
  "artifact_folder",
  {
    artifactId: uuid("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id")
      .notNull()
      .references(() => folder.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.artifactId, table.folderId] }),
    index("artifactFolder_folderId_idx").on(table.folderId),
  ]
)

export const artifactCollection = pgTable(
  "artifact_collection",
  {
    artifactId: uuid("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.artifactId, table.collectionId] }),
    index("artifactCollection_collectionId_idx").on(table.collectionId),
  ]
)

export const artifactRelations = relations(artifact, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [artifact.workspaceId],
    references: [workspace.id],
  }),
  artifactFolders: many(artifactFolder),
  artifactCollections: many(artifactCollection),
}))

export const artifactFolderRelations = relations(artifactFolder, ({ one }) => ({
  artifact: one(artifact, {
    fields: [artifactFolder.artifactId],
    references: [artifact.id],
  }),
  folder: one(folder, {
    fields: [artifactFolder.folderId],
    references: [folder.id],
  }),
}))

export const artifactCollectionRelations = relations(artifactCollection, ({ one }) => ({
  artifact: one(artifact, {
    fields: [artifactCollection.artifactId],
    references: [artifact.id],
  }),
  collection: one(collection, {
    fields: [artifactCollection.collectionId],
    references: [collection.id],
  }),
}))
