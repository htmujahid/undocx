"use client"

import { ClockIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type ArtifactSummary,
  type SortBy,
  artifactsQueryOptions,
  deleteArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { recentArtifactIdsQueryOptions } from "@/lib/data/recent-artifacts"

import { type ArtifactAction, ArtifactListView } from "./artifact-list-view"
import { ArtifactListNavbar } from "./artifact-list-navbar"

export function RecentView({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams()
  const sort = (searchParams.get("sort") as SortBy | null) ?? "updated"
  const qc = useQueryClient()
  const { data: recentIds = [], isLoading: idsLoading } = useQuery(
    recentArtifactIdsQueryOptions(workspaceId)
  )
  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery(
    artifactsQueryOptions(workspaceId, sort)
  )

  const deleteMutation = useMutation({
    ...deleteArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "artifacts"],
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
    <div className="flex h-svh flex-col overflow-hidden">
      <ArtifactListNavbar
        workspaceId={workspaceId}
        label="Recent"
        icon={<ClockIcon className="size-3.5 text-muted-foreground" />}
      />
      <ArtifactListView
        workspaceId={workspaceId}
        artifacts={recentArtifacts}
        isLoading={idsLoading || artifactsLoading}
        emptyTitle="No recent artifacts"
        emptyDescription="Artifacts you open will appear here."
        getActions={getActions}
      />
    </div>
  )
}
