"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"

export function InvitationActions({ token }: { token: string }) {
  const router = useRouter()

  const accept = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      })
      const body = await res.json().catch(() => null)
      if (!res.ok)
        throw new Error(body?.error ?? "Failed to accept invitation")
      return body as { workspaceId: string; artifactId: string | null }
    },
    onSuccess: ({ workspaceId, artifactId }) => {
      toast.success("Invitation accepted")
      router.push(
        artifactId
          ? `/workspace/${workspaceId}/${artifactId}`
          : `/workspace/${workspaceId}`
      )
    },
    onError: (error) => toast.error(error.message),
  })

  const decline = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/invitations/${token}/decline`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to decline invitation")
    },
    onSuccess: () => {
      toast.success("Invitation declined")
      router.push("/workspace")
    },
    onError: (error) => toast.error(error.message),
  })

  const pending = accept.isPending || decline.isPending

  return (
    <div className="mt-6 flex justify-center gap-3">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => decline.mutate()}
      >
        Decline
      </Button>
      <Button disabled={pending} onClick={() => accept.mutate()}>
        {accept.isPending ? "Accepting…" : "Accept invitation"}
      </Button>
    </div>
  )
}
