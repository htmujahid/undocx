"use client";

import { limits } from "~@/lib/context/limits";
import { useRouter } from "next/navigation";
import { ListPane } from "../../_components/list-pane";
import { useCreateVoice, useVoices, type VoiceSummary } from "../query";

export function VoicesPane({ initial }: { initial: VoiceSummary[] }) {
  const router = useRouter();
  const voices = useVoices(initial);
  const { trigger } = useCreateVoice();
  const items = voices.map((voice) => ({
    id: voice.id,
    href: `/library/voices/${voice.id}`,
    title: voice.name,
    meta:
      voice.samples === 0
        ? "No samples yet"
        : `${voice.included} of ${voice.samples} ${voice.samples === 1 ? "sample" : "samples"} in use`,
    badge: voice.isReady ? "Ready" : `${voice.included}/${limits.samplesMin}`,
  }));
  return (
    <ListPane
      title="Voices"
      createLabel="New"
      createAction={async () => {
        const id = await trigger();
        router.push(id ? `/library/voices/${id}` : "/library/voices");
      }}
      items={items}
      emptyText="No voices yet. Add a few things you are happy with and Undocx will write like them."
    />
  );
}
