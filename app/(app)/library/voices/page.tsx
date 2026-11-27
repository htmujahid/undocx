import type { Metadata } from "next";
import { VoiceIcon } from "~@/components/ui/icons";
import { limits } from "~@/lib/context/limits";
import { EmptyPane } from "../_components/empty-pane";

export const metadata: Metadata = {
  title: "Voices",
  description: "How you sound, learned from things you have written.",
};

export default function VoicesPage() {
  return (
    <EmptyPane icon={VoiceIcon} title="Voices">
      How you sound, learned from {limits.samplesMin} to {limits.samplesMax}{" "}
      things you wrote. A voice is style only. It carries no facts and no rules.
    </EmptyPane>
  );
}
