import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Editor } from "~@/editor/editor";
import { getCurrentUser } from "~@/lib/auth/session";
import { listThreadMessages } from "~@/lib/db/repository/ai";
import { findDocument } from "~@/lib/db/repository/document";
import { listNotes } from "~@/lib/db/repository/note";
import { listDocumentSources } from "~@/lib/db/repository/source";
import { EditorShell } from "./_components/editor-shell";
import { DocumentFrame } from "./_components/sheet";
import DocumentLoading from "./loading";

export const metadata: Metadata = { title: "Document" };

function whenLabel(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  return date.toLocaleDateString("en", { day: "numeric", month: "long" });
}

async function DocumentContent({ params }: { params: PageProps<"/documents/[id]">["params"] }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const doc = await findDocument(user.id, id);
  if (!doc) notFound();
  if (doc.status === "drafting") redirect(`/documents/${doc.id}/setup`);
  const [messages, noteRows, sourceRows] = await Promise.all([listThreadMessages(user.id, doc.id), listNotes(doc.id), listDocumentSources(user.id, doc.id)]);
  const notes = noteRows.map((row) => ({ id: row.markId, quote: row.quote, when: whenLabel(row.createdAt), text: row.text }));
  const sources = sourceRows.map((row) => ({ id: row.id, title: row.title, url: row.url ?? undefined }));
  return (
    <Editor documentId={doc.id} initialState={doc.content ? JSON.stringify(doc.content) : null} notes={notes} sources={sources}>
      <EditorShell id={doc.id} title={doc.title} version={doc.contentVersion} messages={messages} notes={notes}>
        <DocumentFrame />
      </EditorShell>
    </Editor>
  );
}

export default function DocumentPage(props: PageProps<"/documents/[id]">) {
  return (
    <Suspense fallback={<DocumentLoading />}>
      <DocumentContent params={props.params} />
    </Suspense>
  );
}
