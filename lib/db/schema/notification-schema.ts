import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { artifact } from "./artifact-schema"
import { user } from "./auth-schema"
import { workspace } from "./workspace-schema"

export const NOTIFICATION_TYPES = [
  "invitation_accepted",
  "workspace_role_changed",
  "workspace_removed",
  "artifact_role_changed",
  "artifact_removed",
  "artifact_created",
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationData {
  actorName: string
  resourceName: string
  role?: string
}

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { enum: NOTIFICATION_TYPES }).notNull(),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    workspaceId: uuid("workspace_id").references(() => workspace.id, {
      onDelete: "set null",
    }),
    artifactId: uuid("artifact_id").references(() => artifact.id, {
      onDelete: "set null",
    }),
    data: jsonb("data").$type<NotificationData>().notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_userId_createdAt_idx").on(
      table.userId,
      table.createdAt
    ),
  ]
)

export const notificationRelations = relations(notification, ({ one }) => ({
  recipient: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  actor: one(user, {
    fields: [notification.actorId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [notification.workspaceId],
    references: [workspace.id],
  }),
  artifact: one(artifact, {
    fields: [notification.artifactId],
    references: [artifact.id],
  }),
}))
