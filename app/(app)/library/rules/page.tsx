import type { Metadata } from "next";
import { RulesIcon } from "~@/components/ui/icons";
import { EmptyPane } from "../_components/empty-pane";

export const metadata: Metadata = {
  title: "Rules",
  description: "What must always or never happen in a draft.",
};

export default function RulesPage() {
  return (
    <EmptyPane icon={RulesIcon} title="Rules">
      What must always or never happen: British spelling, banned words, how
      prices are written. Checked against the draft, not guessed.
    </EmptyPane>
  );
}
