import { notFound } from "next/navigation";
import { getCurrentUser } from "~@/lib/auth/session";
import { findVoice } from "~@/lib/db/repository/voice";
import { VoiceEditor } from "./voice-editor";

export async function VoiceContent({ id }: { id: string }) {
  const voice = await findVoice((await getCurrentUser()).id, id);
  if (!voice) notFound();
  return (
    <VoiceEditor
      key={voice.id}
      voice={{
        id: voice.id,
        name: voice.name,
        notes: voice.notes,
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
