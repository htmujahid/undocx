"use client"

import { ArchiveIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  type SortBy,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

import { ArtifactListNavbar } from "@/components/workspace/views/artifact-list-navbar"
import { type ArtifactAction, ArtifactListView } from "@/components/workspace/views/artifact-list-view"

export function ArchiveView({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams()
  const sort = (searchParams.get("sort") as SortBy | null) ?? "updated"
  const qc = useQueryClient()
  const { data: artifacts = [], isLoading } = useQuery(
    artifactsQueryOptions(workspaceId, sort)
  )

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: ["workspaces", workspaceId, "artifacts"],
    })

  const updateMutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: invalidate,
  })

  const archivedArtifacts = artifacts.filter((a) => a.isArchived)

  const getActions = (art: ArtifactSummary): ArtifactAction[] => [
    {
      type: "action",
      label: "Unarchive",
      onClick: () =>
        updateMutation.mutate({ workspaceId, id: art.id, isArchived: false }),
    },
    { type: "separator" },
    {
      type: "action",
      label: "Delete",
      destructive: true,
      onClick: () => deleteMutation.mutate({ workspaceId, id: art.id }),
    },
  ]

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <ArtifactListNavbar
        workspaceId={workspaceId}
        label="Archive"
        icon={<ArchiveIcon className="size-3.5 text-muted-foreground" />}
      />
      <ArtifactListView
        workspaceId={workspaceId}
        artifacts={archivedArtifacts}
        isLoading={isLoading}
        emptyTitle="Archive is empty"
        emptyDescription="Archived artifacts will appear here."
        getActions={getActions}
      />
    </div>
  )
}
