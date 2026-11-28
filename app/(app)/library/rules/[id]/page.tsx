import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../../_components/empty-pane";
import { RuleSetContent } from "../_components/rule-set-content";

export const metadata: Metadata = { title: "Rule set" };

async function Body({ params }: Pick<PageProps<"/library/rules/[id]">, "params">) {
  const { id } = await params;
  return <RuleSetContent id={id} />;
}

export default function RuleSetPage({ params }: PageProps<"/library/rules/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <Body params={params} />
    </Suspense>
  );
}
