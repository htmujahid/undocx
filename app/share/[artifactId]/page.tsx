import { cache } from "react"

import Link from "next/link"
import { notFound } from "next/navigation"

import { PublicArtifactView } from "@/components/workspace/artifact/public-artifact-view"
import { getPublicArtifact } from "@/lib/db/queries/artifact"

// Content can be unshared at any moment — always check the flag at request time.
export const dynamic = "force-dynamic"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const loadPublicArtifact = cache(async (artifactId: string) => {
  if (!UUID_RE.test(artifactId)) return null
  return getPublicArtifact(artifactId)
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ artifactId: string }>
}) {
  const { artifactId } = await params
  const art = await loadPublicArtifact(artifactId)
  return { title: art?.title ?? "Not found" }
}

export default async function PublicArtifactPage({
  params,
}: {
  params: Promise<{ artifactId: string }>
}) {
  const { artifactId } = await params
  const art = await loadPublicArtifact(artifactId)
  if (!art) notFound()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Renderical
        </Link>
        <span className="text-[11px] text-muted-foreground">
          Shared publicly · read-only
        </span>
      </header>
      <main className="min-h-0 flex-1">
        <PublicArtifactView
          title={art.title}
          content={art.content}
          updatedAt={art.updatedAt.toISOString()}
        />
      </main>
    </div>
  )
}
