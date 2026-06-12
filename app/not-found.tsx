import { SearchXIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Empty className="max-w-md border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for doesn&apos;t exist or may have been
            moved.
          </EmptyDescription>
        </EmptyHeader>
        <div className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ size: "sm" })}>
            Go home
          </Link>
          <Link
            href="/workspace"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Open workspace
          </Link>
        </div>
      </Empty>
    </div>
  )
}
