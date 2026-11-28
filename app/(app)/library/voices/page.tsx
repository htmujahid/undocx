import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../_components/empty-pane";
import { VoicesList } from "./_components/voices-list";
import { listVoices } from "./actions";

export const metadata: Metadata = {
  title: "Voices",
  description: "How you sound, learned from your own writing.",
};

async function List() {
  return <VoicesList initial={await listVoices()} />;
}

export default function VoicesPage() {
  return (
    <Suspense fallback={<PaneFallback />}>
      <List />
    </Suspense>
  );
}
