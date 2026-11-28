"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { freshRuleEntries, parseRuleEntries } from "~@/lib/context/rules";
import { ruleSetSchema, type RuleKind, type RuleSetValues } from "~@/lib/context/schemas";
import { DetailBody, DetailTop } from "../../_components/detail-header";
import { FormSection } from "../../_components/empty-pane";
import { useCreateRuleSet } from "../query";
import { RuleGroups } from "./rule-groups";
import { RuleSetFields } from "./rule-set-fields";
import { SpellingField } from "./spelling-field";

type Draft = { id: string; kind: RuleKind; value: string };

export function RuleSetCreateForm() {
  const router = useRouter();
  const form = useForm<RuleSetValues>({ resolver: zodResolver(ruleSetSchema), defaultValues: { name: "", description: "" } });
  const [rules, setRules] = useState<Draft[]>([]);
  const [spelling, setSpelling] = useState<string | null>(null);
  const { trigger: create } = useCreateRuleSet();
  const save = form.handleSubmit(async (values) => {
    const created = await create({ values, rules: rules.map(({ kind, value }) => ({ kind, value })), spelling });
    if ("error" in created) {
      form.setError("root.server", { message: created.error });
      return;
    }
    router.replace(`/library/rules/${created.id}`);
  });
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <DetailBody>
        <DetailTop backHref="/library/rules" backLabel="Rule sets" form={form} onSave={() => void save()} createLabel="Create rule set" />
        <FormSection title="Basics" description="A named group of rules you can pick on any document.">
          <RuleSetFields control={form.control} autoFocus>
            <SpellingField value={spelling} onChange={setSpelling} />
          </RuleSetFields>
        </FormSection>
        <RuleGroups
          rules={rules}
          onAdd={async (kind, value) => {
            const fresh = freshRuleEntries(kind, parseRuleEntries(kind, value), rules);
            if (fresh.length === 0) return "That rule is already in the set.";
            setRules((current) => [...current, ...fresh.map((entry) => ({ id: crypto.randomUUID(), kind, value: entry }))]);
            return null;
          }}
          onRemove={(id) => setRules((current) => current.filter((rule) => rule.id !== id))}
        />
      </DetailBody>
    </div>
  );
}
