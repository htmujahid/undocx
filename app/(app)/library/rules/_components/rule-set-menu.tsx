"use client";

import { LibraryItemMenu } from "../../_components/library-item-menu";
import { useDeleteRuleSet } from "../query";

export function RuleSetMenu({ set }: { set: { id: string; name: string } }) {
  const { trigger: remove } = useDeleteRuleSet(set.id);
  return <LibraryItemMenu label={set.name} deleteTitle="Delete this rule set?" deleteDescription="All its rules are deleted too. Documents that used it keep their text, but lose the link." onDelete={() => remove()} />;
}
