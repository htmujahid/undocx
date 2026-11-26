import type { Metadata } from "next";
import { getCurrentUser } from "~@/lib/auth/session";
import { AssistantSidebar } from "./_components/assistant";
import { EditorShell } from "./_components/editor-shell";
import { ProposalDocument, proposal, proposalNotes } from "./_components/proposal";
import { OutlineSidebar } from "./_components/outline-sidebar";
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
  return (
    <EditorShell id={id} title={doc.title} notes={proposalNotes} sidebar={<OutlineSidebar doc={proposal} />} assistant={<AssistantSidebar />}>
      <ProposalDocument title={doc.title} />
    </EditorShell>
  );
}
