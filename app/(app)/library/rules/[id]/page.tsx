import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findRuleSet } from "~@/lib/db/repository/rule-set";
import { PaneFallback } from "../../_components/empty-pane";
import { RuleSetEditor } from "./_components/rule-set-editor";

export const metadata: Metadata = { title: "Rule set" };

async function RuleSetContent({
  params,
}: {
  params: PageProps<"/library/rules/[id]">["params"];
}) {
  const { id } = await params;
  const set = await findRuleSet((await getCurrentUser()).id, id);
  if (!set) notFound();
  return (
    <RuleSetEditor
      key={set.id}
      set={{ id: set.id, name: set.name, description: set.description }}
      rules={set.rules.map((rule) => ({
        id: rule.id,
        kind: rule.kind,
        value: rule.value,
      }))}
    />
  );
}

export default function RuleSetPage(props: PageProps<"/library/rules/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <RuleSetContent params={props.params} />
    </Suspense>
  );
}
