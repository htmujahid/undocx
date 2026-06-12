"use client"

import { FileXIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function NotFound() {
  const params = useParams<{ id: string }>()

  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Empty className="max-w-md border-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileXIcon />
            </EmptyMedia>
            <EmptyTitle>Artifact not found</EmptyTitle>
            <EmptyDescription>
              This artifact doesn&apos;t exist or may have been deleted.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href={`/workspace/${params.id}`}
            className={buttonVariants({ size: "sm" })}
          >
            Back to workspace
          </Link>
        </Empty>
      </div>
    </div>
  )
}
