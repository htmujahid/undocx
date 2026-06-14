import { relations } from "drizzle-orm"
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { artifact } from "./artifact-schema"
import { user } from "./auth-schema"
import { workspace } from "./workspace-schema"

export const MEMBER_ROLES = ["editor", "viewer"] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const workspaceMember = pgTable(
  "workspace_member",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: MEMBER_ROLES }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    index("workspaceMember_userId_idx").on(table.userId),
  ]
)

export const artifactMember = pgTable(
  "artifact_member",
  {
    artifactId: uuid("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: MEMBER_ROLES }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.artifactId, table.userId] }),
    index("artifactMember_userId_idx").on(table.userId),
  ]
)

export const invitation = pgTable(
  "invitation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    role: text("role", { enum: MEMBER_ROLES }).notNull(),
    workspaceId: uuid("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    artifactId: uuid("artifact_id").references(() => artifact.id, {
      onDelete: "cascade",
    }),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("invitation_token_idx").on(table.token),
    index("invitation_email_idx").on(table.email),
    index("invitation_workspaceId_idx").on(table.workspaceId),
    index("invitation_artifactId_idx").on(table.artifactId),
  ]
)

export const workspaceMemberRelations = relations(
  workspaceMember,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMember.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMember.userId],
      references: [user.id],
    }),
  })
)

export const artifactMemberRelations = relations(artifactMember, ({ one }) => ({
  artifact: one(artifact, {
    fields: [artifactMember.artifactId],
    references: [artifact.id],
  }),
  user: one(user, {
    fields: [artifactMember.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  workspace: one(workspace, {
    fields: [invitation.workspaceId],
    references: [workspace.id],
  }),
  artifact: one(artifact, {
    fields: [invitation.artifactId],
    references: [artifact.id],
  }),
  inviter: one(user, {
    fields: [invitation.invitedBy],
    references: [user.id],
  }),
}))
