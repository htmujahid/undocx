"use client";

import { limits } from "~@/lib/context/limits";
import { LibraryList } from "../../_components/library-list";
import { VoiceMenu } from "./voice-menu";
import { useVoices, type VoiceSummary } from "../query";

export function VoicesList({ initial }: { initial: VoiceSummary[] }) {
  const voices = useVoices(initial);
  const items = voices.map((voice) => ({
    id: voice.id,
    href: `/library/voices/${voice.id}`,
    title: voice.name,
    meta:
      voice.samples === 0
        ? "No samples yet"
        : `${voice.included} of ${voice.samples} ${voice.samples === 1 ? "sample" : "samples"} in use`,
    badge: voice.isReady ? "Ready" : `${voice.included}/${limits.samplesMin}`,
    menu: <VoiceMenu voice={voice} />,
  }));
  return (
    <LibraryList
      title="Voices"
      description="How you sound, learned from a few things you are happy with. Pick one on a new document and Undocx writes like you."
      createLabel="New voice"
      createHref="/library/voices/new"
      items={items}
      emptyText="No voices yet. Add a few things you are happy with and Undocx will write like them."
    />
  );
}
