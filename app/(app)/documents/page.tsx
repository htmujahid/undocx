import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { listDocuments } from "~@/lib/db/repository/document";
import { countDocumentsByFolder, listFolders, listTags } from "~@/lib/db/repository/organization";
import { parseListQuery } from "~@/lib/documents/list-query";
import { DocumentsHeader } from "./_components/documents-header";
import { DocumentList } from "./_components/document-list";

export const metadata: Metadata = {
  title: "Documents",
  description: "Your documents in Undocx.",
};

async function Documents({ searchParams }: Pick<PageProps<"/documents">, "searchParams">) {
  const user = await getCurrentUser();
  const query = parseListQuery(await searchParams);
  const [result, folders, tags, counts] = await Promise.all([listDocuments(user.id, query), listFolders(user.id), listTags(user.id), countDocumentsByFolder(user.id)]);
  return <DocumentList query={query} result={result} folders={folders} tags={tags} counts={counts} />;
}

export default function DocumentsPage({ searchParams }: PageProps<"/documents">) {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div role="status" aria-label="Loading" className="h-full min-h-80" />}>
          <Documents searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
