import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../_components/empty-pane";
import { RulesList } from "./_components/rules-list";
import { listRuleSets } from "./actions";

export const metadata: Metadata = {
  title: "House rules",
  description: "Spelling, words and formats Undocx follows and checks.",
};

async function List() {
  return <RulesList initial={await listRuleSets()} />;
}

export default function RulesPage() {
  return (
    <Suspense fallback={<PaneFallback />}>
      <List />
    </Suspense>
  );
}
