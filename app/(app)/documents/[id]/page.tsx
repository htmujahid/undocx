import type { Metadata } from "next";
import { Editor } from "~@/editor/editor";
import { getCurrentUser } from "~@/lib/auth/session";
import { serializeBlocks } from "~@/editor/server/serialize";
import { EditorShell } from "./_components/editor-shell";
import { proposal, proposalNotes, proposalSources } from "./_components/proposal";
import { proposalBlocks } from "./_components/proposal-content";
import { DocumentFrame } from "./_components/sheet";
import { findDocument } from "../_components/documents";

export async function generateMetadata({ params }: PageProps<"/documents/[id]">): Promise<Metadata> {
  await getCurrentUser();
  const { id } = await params;
  return { title: findDocument(id).title };
}

export default async function DocumentPage({ params }: PageProps<"/documents/[id]">) {
  await getCurrentUser();
  const { id } = await params;
  const doc = findDocument(id);
  const initialState = serializeBlocks([{ type: "heading", tag: "h1", text: doc.title }, ...proposalBlocks]);
  return (
    <Editor documentId={id} initialState={initialState} notes={proposalNotes} sources={proposalSources}>
      <EditorShell id={id} title={doc.title} doc={proposal}>
        <DocumentFrame />
      </EditorShell>
    </Editor>
  );
}
