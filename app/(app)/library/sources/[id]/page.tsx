import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findSource } from "~@/lib/db/repository/source";
import { PaneFallback } from "../../_components/empty-pane";
import { SourceDetail } from "./_components/source-detail";

export const metadata: Metadata = { title: "Source" };

async function SourceContent({ params }: { params: PageProps<"/library/sources/[id]">["params"] }) {
  const { id } = await params;
  const found = await findSource((await getCurrentUser()).id, id);
  if (!found) notFound();
  return (
    <SourceDetail
      key={found.id}
      source={{
        id: found.id,
        kind: found.kind,
        title: found.title,
        url: found.url,
        wordCount: found.wordCount,
        preview: found.content.slice(0, 3000),
        isTruncated: found.content.length > 3000,
        file: found.asset ? { name: found.asset.filename, size: found.asset.size } : null,
        documents: found.documents,
      }}
    />
  );
}

export default function SourcePage(props: PageProps<"/library/sources/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <SourceContent params={props.params} />
    </Suspense>
  );
}
