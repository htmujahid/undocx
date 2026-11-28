"use client";

import type { RuleKind } from "~@/lib/context/schemas";
import { FormSection } from "../../_components/empty-pane";
import type { RuleData } from "./rule-types";
import { RuleSection } from "./rule-section";

type Handlers = {
  rules: RuleData[];
  onAdd: (kind: RuleKind, value: string) => Promise<string | null>;
  onRemove: (id: string) => Promise<unknown> | void;
};

export function RuleGroups({ rules, onAdd, onRemove }: Handlers) {
  const of = (kind: RuleData["kind"]) => rules.filter((rule) => rule.kind === kind);
  return (
    <>
      <FormSection title="Banned words" description="Words and phrases that never appear. They are flagged in the margin and fixed in one press.">
        <RuleSection kind="banned_word" title="Banned words" placeholder="leverage, synergy, robust" rules={of("banned_word")} hint="Separate several with commas." onAdd={onAdd} onRemove={onRemove} />
      </FormSection>
      <FormSection title="Formats" description="How prices, dates and numbers are written.">
        <RuleSection kind="format" title="Formats" placeholder="Prices as £18,400, no decimals" rules={of("format")} hint="One rule at a time, in plain words." onAdd={onAdd} onRemove={onRemove} />
      </FormSection>
      <FormSection title="Other rules" description="Anything else that must always or never happen.">
        <RuleSection kind="custom" title="Other rules" placeholder="Never address the reader by first name" rules={of("custom")} hint="Write it as an instruction." onAdd={onAdd} onRemove={onRemove} />
      </FormSection>
    </>
  );
}
