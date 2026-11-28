import { notFound } from "next/navigation";
import { getCurrentUser } from "~@/lib/auth/session";
import { findSource } from "~@/lib/db/repository/source";
import { SourceDetail } from "./source-detail";

export async function SourceContent({ id }: { id: string }) {
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
