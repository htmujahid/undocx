import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findBrief } from "~@/lib/db/repository/brief";
import { findProfile } from "~@/lib/db/repository/profile";
import { findRuleSet } from "~@/lib/db/repository/rule-set";
import { countDocumentSources } from "~@/lib/db/repository/source";
import { findVoice } from "~@/lib/db/repository/voice";
import type { OutlineMode } from "~@/lib/documents/brief";
import { findDocumentType } from "~@/lib/documents/types";
import { DocumentsHeader } from "../../_components/documents-header";
import { SetupFlow } from "./_components/setup-flow";

export const metadata: Metadata = { title: "Set up your document" };

async function Setup({ params }: { params: PageProps<"/documents/[id]/setup">["params"] }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const found = await findBrief(user.id, id);
  if (!found) notFound();
  const { document, brief } = found;
  if (document.status !== "drafting") redirect(`/documents/${id}`);
  const [profile, voice, ruleSet, sourceCount] = await Promise.all([
    document.profileId ? findProfile(user.id, document.profileId) : null,
    document.voiceId ? findVoice(user.id, document.voiceId) : null,
    document.ruleSetId ? findRuleSet(user.id, document.ruleSetId) : null,
    countDocumentSources(id),
  ]);
  const picks = [
    document.type ? { label: "Type", value: findDocumentType(document.type)?.label ?? document.type } : null,
    profile ? { label: "Profile", value: profile.name } : null,
    voice ? { label: "Voice", value: voice.name } : null,
    ruleSet ? { label: "Rules", value: ruleSet.name } : null,
    sourceCount > 0 ? { label: "Sources", value: `${sourceCount} attached` } : null,
  ].filter((pick) => pick !== null);
  return <SetupFlow id={id} prompt={brief.prompt} picks={picks} questions={brief.questions} answers={brief.answers} advice={brief.advice} outline={brief.outline as OutlineMode} />;
}

export default function SetupPage(props: PageProps<"/documents/[id]/setup">) {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader hasNewButton={false} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div role="status" aria-label="Loading" className="h-full min-h-80" />}>
          <Setup params={props.params} />
        </Suspense>
      </main>
    </div>
  );
}
