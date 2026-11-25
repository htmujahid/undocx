import type { Metadata } from "next";
import { DocumentsHeader } from "./_components/documents-header";
import { DocumentList } from "./_components/document-list";

export const metadata: Metadata = {
  title: "Documents",
  description: "Your documents in Undocx.",
};

export default function DocumentsPage() {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <DocumentList />
      </main>
    </div>
  );
}
