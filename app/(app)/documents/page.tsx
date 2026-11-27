import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { DocumentsHeader } from "./_components/documents-header";
import { DocumentList } from "./_components/document-list";
import { listDocuments } from "./actions";

export const metadata: Metadata = {
  title: "Documents",
  description: "Your documents in Undocx.",
};

async function Documents() {
  return <DocumentList initial={await listDocuments()} />;
}

export default async function DocumentsPage() {
  await getCurrentUser();
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div role="status" aria-label="Loading" className="h-full min-h-80" />}>
          <Documents />
        </Suspense>
      </main>
    </div>
  );
}
