import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findVoice } from "~@/lib/db/repository/voice";
import { PaneFallback } from "../../_components/empty-pane";
import { VoiceEditor } from "./_components/voice-editor";

export const metadata: Metadata = { title: "Voice" };

async function VoiceContent({
  params,
}: {
  params: PageProps<"/library/voices/[id]">["params"];
}) {
  const { id } = await params;
  const voice = await findVoice((await getCurrentUser()).id, id);
  if (!voice) notFound();
  return (
    <VoiceEditor
      key={voice.id}
      voice={{
        id: voice.id,
        name: voice.name,
        notes: voice.notes,
        included: voice.included,
        isReady: voice.isReady,
      }}
      samples={voice.samples.map((sample) => ({
        id: sample.id,
        title: sample.title,
        preview: sample.content.slice(0, 220),
        wordCount: sample.wordCount,
        isIncluded: sample.isIncluded,
      }))}
    />
  );
}

export default function VoicePage(props: PageProps<"/library/voices/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <VoiceContent params={props.params} />
    </Suspense>
  );
}
