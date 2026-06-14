"use client"

import { useState } from "react"

import { CheckIcon, CopyIcon, Globe2Icon, Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  type Artifact,
  artifactQueryOptions,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"

import { ShareMembers } from "@/components/workspace/sharing/share-members"

export function SharePopover({
  workspaceId,
  artifactId,
  isPublic,
}: {
  workspaceId: string
  artifactId: string
  isPublic: boolean
}) {
  const qc = useQueryClient()
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${artifactId}`
      : `/share/${artifactId}`

  const { mutate: setPublic, isPending } = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: (updated: Artifact) => {
      qc.setQueryData(
        artifactQueryOptions(workspaceId, artifactId).queryKey,
        updated
      )
    },
    onError: () => toast.error("Failed to update sharing settings."),
  })

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Share artifact" />
        }
      >
        {isPublic ? (
          <Globe2Icon className="text-foreground" />
        ) : (
          <Share2Icon className="text-muted-foreground" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        <div className="space-y-0.5">
          <Label className="text-sm">Share with people</Label>
          <p className="text-xs text-muted-foreground">
            Invite people to this document only, they won&apos;t see the rest
            of the workspace.
          </p>
        </div>
        <div className="mt-3">
          <ShareMembers
            workspaceId={workspaceId}
            artifactId={artifactId}
            canManage
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="share-public-toggle" className="text-sm">
              Public access
            </Label>
            <p className="text-xs text-muted-foreground">
              Anyone with the link can view this document.
            </p>
          </div>
          <Switch
            id="share-public-toggle"
            checked={isPublic}
            disabled={isPending}
            onCheckedChange={(checked) =>
              setPublic({ workspaceId, id: artifactId, isPublic: checked })
            }
          />
        </div>

        {isPublic && (
          <div className="mt-4 flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="h-8 flex-1 text-xs"
              aria-label="Public link"
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={copyLink}
              aria-label="Copy public link"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
