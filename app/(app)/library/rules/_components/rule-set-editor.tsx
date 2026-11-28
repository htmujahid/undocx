"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { ruleSetSchema, type RuleSetValues } from "~@/lib/context/schemas";
import { DetailBody, DetailTop } from "../../_components/detail-header";
import { FormSection } from "../../_components/empty-pane";
import { useAddRule, useRemoveRule, useSetSpelling, useUpdateRuleSet } from "../query";
import { RuleGroups } from "./rule-groups";
import { RuleSetFields } from "./rule-set-fields";
import type { RuleData } from "./rule-types";
import { SpellingField } from "./spelling-field";

export function RuleSetEditor({ set, rules }: { set: { id: string; name: string; description: string }; rules: RuleData[] }) {
  const form = useForm<RuleSetValues>({ resolver: zodResolver(ruleSetSchema), defaultValues: { name: set.name, description: set.description } });
  const [, startTransition] = useTransition();
  const { trigger: update } = useUpdateRuleSet(set.id);
  const { trigger: changeSpelling } = useSetSpelling(set.id);
  const { trigger: add } = useAddRule(set.id);
  const { trigger: remove } = useRemoveRule(set.id);
  const save = form.handleSubmit(async (values) => {
    const result = await update(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });
  const spelling = rules.find((rule) => rule.kind === "spelling")?.value ?? null;

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <DetailBody>
        <DetailTop backHref="/library/rules" backLabel="Rule sets" form={form} onSave={() => void save()} />
        <FormSection title="Basics" description="A named group of rules you can pick on any document.">
          <RuleSetFields control={form.control}>
            <SpellingField
              value={spelling}
              onChange={(next) =>
                startTransition(async () => {
                  await changeSpelling(next ?? "");
                })
              }
            />
          </RuleSetFields>
        </FormSection>
        <RuleGroups rules={rules} onAdd={async (kind, value) => (await add({ kind, values: { value } }))?.error ?? null} onRemove={(id) => remove(id)} />
      </DetailBody>
    </div>
  );
}
