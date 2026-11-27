import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { listProfiles } from "~@/lib/db/repository/profile";
import { listRuleSets } from "~@/lib/db/repository/rule-set";
import { listVoices } from "~@/lib/db/repository/voice";
import { DocumentsHeader } from "../_components/documents-header";
import { NewDocumentForm } from "./_components/new-document-form";

export const metadata: Metadata = {
  title: "New document",
  description: "Describe what you are writing and Undocx asks what it still needs.",
};

async function NewDocument() {
  const user = await getCurrentUser();
  const [profiles, voices, ruleSets] = await Promise.all([listProfiles(user.id), listVoices(user.id), listRuleSets(user.id)]);
  return (
    <NewDocumentForm
      profiles={profiles.map((profile) => ({ id: profile.id, name: profile.name, isDefault: profile.isDefault }))}
      voices={voices.map((voice) => ({ id: voice.id, name: voice.name }))}
      ruleSets={ruleSets.map((set) => ({ id: set.id, name: set.name }))}
    />
  );
}

export default function NewDocumentPage() {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader hasNewButton={false} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div role="status" aria-label="Loading" className="h-full min-h-80" />}>
          <NewDocument />
        </Suspense>
      </main>
    </div>
  );
}
