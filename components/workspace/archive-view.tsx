"use client"

import { ArchiveIcon } from "lucide-react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"
import { foldersQueryOptions } from "@/lib/data/folders"

import { type ArtifactAction, ArtifactListView } from "./artifact-list-view"

export function ArchiveView({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient()
  const { data: artifacts = [], isLoading } = useQuery(
    artifactsQueryOptions(workspaceId)
  )
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const { data: collections = [] } = useQuery(
    collectionsQueryOptions(workspaceId)
  )

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: artifactsQueryOptions(workspaceId).queryKey,
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
    <ArtifactListView
      workspaceId={workspaceId}
      artifacts={archivedArtifacts}
      folders={folders}
      collections={collections}
      isLoading={isLoading}
      headerLabel="Archive"
      headerIcon={<ArchiveIcon className="size-3.5 text-muted-foreground" />}
      emptyTitle="Archive is empty"
      emptyDescription="Archived artifacts will appear here."
      getActions={getActions}
    />
  )
}
