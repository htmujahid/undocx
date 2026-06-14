import { mutationOptions, queryOptions } from "@tanstack/react-query"

export type MemberRole = "editor" | "viewer"
export type WorkspaceRole = "owner" | MemberRole

export interface Member {
  userId: string
  name: string
  email: string
  image: string | null
  role: WorkspaceRole
}

export interface PendingInvitation {
  id: string
  email: string
  role: MemberRole
  createdAt: string
  expiresAt: string
}

export interface MembersResponse {
  members: Member[]
  invitations: PendingInvitation[]
}

export interface SharedArtifact {
  id: string
  title: string
  workspaceId: string
  workspaceName: string
  role: MemberRole
  updatedAt: string
}

export interface MyInvitation {
  id: string
  token: string
  role: MemberRole
  workspaceId: string | null
  artifactId: string | null
  workspaceName: string | null
  artifactTitle: string | null
  inviterName: string
  createdAt: string
  expiresAt: string
}

async function jsonOrThrow<T>(res: Response, fallback: string): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? fallback)
  return body as T
}

export const workspaceMembersQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: async (): Promise<MembersResponse> => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`)
      return jsonOrThrow(res, "Failed to fetch members")
    },
    enabled: !!workspaceId,
  })

export const artifactMembersQueryOptions = (
  workspaceId: string,
  artifactId: string
) =>
  queryOptions({
    queryKey: ["workspaces", workspaceId, "artifacts", artifactId, "members"],
    queryFn: async (): Promise<MembersResponse> => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}/members`
      )
      return jsonOrThrow(res, "Failed to fetch members")
    },
    enabled: !!workspaceId && !!artifactId,
  })

export const sharedWithMeQueryOptions = queryOptions({
  queryKey: ["shared-with-me"],
  queryFn: async (): Promise<SharedArtifact[]> => {
    const res = await fetch("/api/shared-with-me")
    return jsonOrThrow(res, "Failed to fetch shared documents")
  },
})

export const myInvitationsQueryOptions = queryOptions({
  queryKey: ["my-invitations"],
  queryFn: async (): Promise<MyInvitation[]> => {
    const res = await fetch("/api/invitations")
    return jsonOrThrow(res, "Failed to fetch invitations")
  },
})

export const respondToInvitationMutationOptions = mutationOptions({
  mutationFn: async ({
    token,
    action,
  }: {
    token: string
    action: "accept" | "decline"
  }): Promise<{ workspaceId: string; artifactId: string | null } | null> => {
    const res = await fetch(`/api/invitations/${token}/${action}`, {
      method: "POST",
    })
    if (action === "decline") {
      if (!res.ok) throw new Error("Failed to decline invitation")
      return null
    }
    return jsonOrThrow(res, "Failed to accept invitation")
  },
})

export const inviteMemberMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    artifactId,
    email,
    role,
  }: {
    workspaceId: string
    artifactId?: string
    email: string
    role: MemberRole
  }): Promise<PendingInvitation> => {
    const url = artifactId
      ? `/api/workspaces/${workspaceId}/artifacts/${artifactId}/members`
      : `/api/workspaces/${workspaceId}/members`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    })
    return jsonOrThrow(res, "Failed to send invitation")
  },
})

export const updateMemberRoleMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    artifactId,
    userId,
    role,
  }: {
    workspaceId: string
    artifactId?: string
    userId: string
    role: MemberRole
  }): Promise<void> => {
    const url = artifactId
      ? `/api/workspaces/${workspaceId}/artifacts/${artifactId}/members/${userId}`
      : `/api/workspaces/${workspaceId}/members/${userId}`
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? "Failed to update role")
    }
  },
})

export const removeMemberMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    artifactId,
    userId,
  }: {
    workspaceId: string
    artifactId?: string
    userId: string
  }): Promise<void> => {
    const url = artifactId
      ? `/api/workspaces/${workspaceId}/artifacts/${artifactId}/members/${userId}`
      : `/api/workspaces/${workspaceId}/members/${userId}`
    const res = await fetch(url, { method: "DELETE" })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? "Failed to remove member")
    }
  },
})

export const revokeInvitationMutationOptions = mutationOptions({
  mutationFn: async ({
    workspaceId,
    invitationId,
  }: {
    workspaceId: string
    invitationId: string
  }): Promise<void> => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/invitations/${invitationId}`,
      { method: "DELETE" }
    )
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? "Failed to revoke invitation")
    }
  },
})
