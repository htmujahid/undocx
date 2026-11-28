"use client";

import { useTransition } from "react";
import { Button } from "~@/components/ui/button";
import { XIcon } from "~@/components/ui/icons";
import { useRemoveRule } from "../../query";
import type { RuleData } from "./rule-types";

export function RuleList({
  ruleSetId,
  rules,
}: {
  ruleSetId: string;
  rules: RuleData[];
}) {
  const [isPending, startTransition] = useTransition();
  const { trigger: remove } = useRemoveRule(ruleSetId);
  if (rules.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-input bg-card py-1 pr-1 pl-3 text-sm text-foreground"
        >
          <span className="min-w-0 truncate">{rule.value}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${rule.value}`}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await remove(rule.id);
              })
            }
            className="size-6 rounded-full"
          >
            <XIcon className="size-3" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
