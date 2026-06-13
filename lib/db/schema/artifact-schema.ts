import { relations, sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core"

import { user } from "./auth-schema"
import { collection } from "./collection-schema"
import { folder } from "./folder-schema"
import { workspace } from "./workspace-schema"

export const artifact = pgTable(
  "artifact",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    // Markdown source (Renderical dialect — see editor/markdown-transformers.ts)
    content: text("content"),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isArchived: boolean("is_archived").default(false).notNull(),
    // Anyone with the link can view the artifact at /share/[artifactId]
    // without signing in. Mutations still require workspace ownership.
    isPublic: boolean("is_public").default(false).notNull(),
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

export const artifactChunk = pgTable(
  "artifact_chunk",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artifactId: uuid("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    heading: text("heading"),
    content: text("content").notNull(),
    hash: text("hash").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("artifactChunk_artifactId_idx").on(table.artifactId),
    uniqueIndex("artifactChunk_artifactId_heading_unique")
      .on(table.artifactId, table.heading)
      .where(sql`heading IS NOT NULL`),
  ]
)

export const artifactRelations = relations(artifact, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [artifact.workspaceId],
    references: [workspace.id],
  }),
  artifactFolders: many(artifactFolder),
  artifactCollections: many(artifactCollection),
  chunks: many(artifactChunk),
}))

export const artifactChunkRelations = relations(artifactChunk, ({ one }) => ({
  artifact: one(artifact, {
    fields: [artifactChunk.artifactId],
    references: [artifact.id],
  }),
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

export const artifactCollectionRelations = relations(
  artifactCollection,
  ({ one }) => ({
    artifact: one(artifact, {
      fields: [artifactCollection.artifactId],
      references: [artifact.id],
    }),
    collection: one(collection, {
      fields: [artifactCollection.collectionId],
      references: [collection.id],
    }),
  })
)

export const artifactFavorite = pgTable(
  "artifact_favorite",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    artifactId: uuid("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.artifactId] }),
    index("artifactFavorite_userId_idx").on(table.userId),
  ]
)

export const artifactFavoriteRelations = relations(
  artifactFavorite,
  ({ one }) => ({
    artifact: one(artifact, {
      fields: [artifactFavorite.artifactId],
      references: [artifact.id],
    }),
    user: one(user, {
      fields: [artifactFavorite.userId],
      references: [user.id],
    }),
  })
)
