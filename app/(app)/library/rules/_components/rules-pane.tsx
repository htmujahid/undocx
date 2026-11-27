"use client";

import { spellingOptions } from "~@/lib/context/limits";
import { useRouter } from "next/navigation";
import { ListPane } from "../../_components/list-pane";
import { useCreateRuleSet, useRuleSets, type RuleSetSummary } from "../query";

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function RulesPane({ initial }: { initial: RuleSetSummary[] }) {
  const router = useRouter();
  const sets = useRuleSets(initial);
  const { trigger } = useCreateRuleSet();
  const items = sets.map((set) => {
    const parts = [
      spellingOptions.find((option) => option.value === set.spelling)?.label,
      set.banned > 0 ? plural(set.banned, "banned word") : null,
      set.formats > 0 ? plural(set.formats, "format") : null,
      set.custom > 0 ? plural(set.custom, "other rule") : null,
    ].filter(Boolean);
    return {
      id: set.id,
      href: `/library/rules/${set.id}`,
      title: set.name,
      meta: parts.length > 0 ? parts.join(" · ") : "No rules yet",
    };
  });
  return (
    <ListPane
      title="Rule sets"
      createLabel="New"
      createAction={async () => {
        const id = await trigger();
        router.push(id ? `/library/rules/${id}` : "/library/rules");
      }}
      items={items}
      emptyText="No rule sets yet. Start with the spelling you use and the words you never write."
    />
  );
}
