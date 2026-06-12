import { cache } from "react"

import { and, eq } from "drizzle-orm"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PublicArtifactView } from "@/components/workspace/public-artifact-view"
import { db } from "@/lib/db"
import { artifact } from "@/lib/db/schema"

// Content can be unshared at any moment — always check the flag at request time.
export const dynamic = "force-dynamic"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const getPublicArtifact = cache(async (artifactId: string) => {
  if (!UUID_RE.test(artifactId)) return null
  const [art] = await db
    .select({
      id: artifact.id,
      title: artifact.title,
      content: artifact.content,
      updatedAt: artifact.updatedAt,
    })
    .from(artifact)
    .where(
      and(
        eq(artifact.id, artifactId),
        eq(artifact.isPublic, true),
        eq(artifact.isArchived, false)
      )
    )
  return art ?? null
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ artifactId: string }>
}) {
  const { artifactId } = await params
  const art = await getPublicArtifact(artifactId)
  return { title: art?.title ?? "Not found" }
}

export default async function PublicArtifactPage({
  params,
}: {
  params: Promise<{ artifactId: string }>
}) {
  const { artifactId } = await params
  const art = await getPublicArtifact(artifactId)
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
