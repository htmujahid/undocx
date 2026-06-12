"use client"

import { ClockIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"
import { foldersQueryOptions } from "@/lib/data/folders"
import { recentArtifactIdsQueryOptions } from "@/lib/data/recent-artifacts"
import { ArtifactListView, type ArtifactAction } from "./artifact-list-view"

interface RecentViewProps {
  workspaceId: string
}

export function RecentView({ workspaceId }: RecentViewProps) {
  const qc = useQueryClient()
  const { data: recentIds = [], isLoading: idsLoading } = useQuery(
    recentArtifactIdsQueryOptions(workspaceId)
  )
  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery(
    artifactsQueryOptions(workspaceId)
  )
  const { data: folders = [] } = useQuery(foldersQueryOptions(workspaceId))
  const { data: collections = [] } = useQuery(collectionsQueryOptions(workspaceId))

  const invalidateRecent = () =>
    qc.invalidateQueries({ queryKey: recentArtifactIdsQueryOptions(workspaceId).queryKey })

  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: artifactsQueryOptions(workspaceId).queryKey })
      invalidateRecent()
    },
  })

  const recentArtifacts = recentIds
    .map((id) => artifacts.find((a) => a.id === id))
    .filter((a): a is ArtifactSummary => !!a)

  const getActions = (art: ArtifactSummary): ArtifactAction[] => [
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
      artifacts={recentArtifacts}
      folders={folders}
      collections={collections}
      isLoading={idsLoading || artifactsLoading}
      headerLabel="Recent"
      headerIcon={<ClockIcon className="size-3.5 text-muted-foreground" />}
      emptyTitle="No recent artifacts"
      emptyDescription="Artifacts you open will appear here."
      getActions={getActions}
    />
  )
}
