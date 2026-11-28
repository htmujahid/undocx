import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../../_components/empty-pane";
import { VoiceContent } from "../_components/voice-content";

export const metadata: Metadata = { title: "Voice" };

async function Body({ params }: Pick<PageProps<"/library/voices/[id]">, "params">) {
  const { id } = await params;
  return <VoiceContent id={id} />;
}

export default function VoicePage({ params }: PageProps<"/library/voices/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <Body params={params} />
    </Suspense>
  );
}
