"use client";

import { spellingOptions } from "~@/lib/context/limits";
import { LibraryList } from "../../_components/library-list";
import { RuleSetMenu } from "./rule-set-menu";
import { useRuleSets, type RuleSetSummary } from "../query";

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function RulesList({ initial }: { initial: RuleSetSummary[] }) {
  const sets = useRuleSets(initial);
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
      menu: <RuleSetMenu set={set} />,
    };
  });
  return (
    <LibraryList
      title="Rule sets"
      description="Spelling, banned words, formats and your own rules. Undocx follows them when it writes and flags what breaks them."
      createLabel="New rule set"
      createHref="/library/rules/new"
      items={items}
      emptyText="No rule sets yet. Start with the spelling you use and the words you never write."
    />
  );
}
