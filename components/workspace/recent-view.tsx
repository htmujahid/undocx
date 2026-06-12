"use client"

import { ClockIcon } from "lucide-react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { recentArtifactIdsQueryOptions } from "@/lib/data/recent-artifacts"

import { type ArtifactAction, ArtifactListView } from "./artifact-list-view"

export function RecentView({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient()
  const { data: recentIds = [], isLoading: idsLoading } = useQuery(
    recentArtifactIdsQueryOptions(workspaceId)
  )
  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery(
    artifactsQueryOptions(workspaceId)
  )

  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: artifactsQueryOptions(workspaceId).queryKey,
      })
      qc.invalidateQueries({
        queryKey: recentArtifactIdsQueryOptions(workspaceId).queryKey,
      })
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
      isLoading={idsLoading || artifactsLoading}
      headerLabel="Recent"
      headerIcon={<ClockIcon className="size-3.5 text-muted-foreground" />}
      emptyTitle="No recent artifacts"
      emptyDescription="Artifacts you open will appear here."
      getActions={getActions}
    />
  )
}
