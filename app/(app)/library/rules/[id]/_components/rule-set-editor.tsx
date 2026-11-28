"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { ruleSetSchema, type RuleSetValues } from "~@/lib/context/schemas";
import { useRouter } from "next/navigation";
import { useDeleteRuleSet, useSetSpelling, useUpdateRuleSet } from "../../query";
import { limits, spellingOptions } from "~@/lib/context/limits";
import { DeleteDialog } from "~@/components/delete-dialog";
import { DetailHeader } from "../../../_components/detail-header";
import { FormSection } from "../../../_components/empty-pane";
import { OptionSelect } from "~@/components/ui/option-select";
import { RuleSection } from "./rule-section";
import type { RuleData, RuleKind } from "./rule-types";

export function RuleSetEditor({
  set,
  rules,
}: {
  set: { id: string; name: string; description: string };
  rules: RuleData[];
}) {
  const form = useForm<RuleSetValues>({ resolver: zodResolver(ruleSetSchema), defaultValues: { name: set.name, description: set.description } });
  const name = useWatch({ control: form.control, name: "name" });
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { trigger: update } = useUpdateRuleSet(set.id);
  const { trigger: remove } = useDeleteRuleSet(set.id);
  const { trigger: changeSpelling } = useSetSpelling(set.id);
  const save = form.handleSubmit(async (values) => {
    const result = await update(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });
  const spelling =
    rules.find((rule) => rule.kind === "spelling")?.value ?? null;
  const of = (kind: RuleKind) => rules.filter((rule) => rule.kind === kind);

  return (
    <>
      <DetailHeader
        backHref="/library/rules"
        eyebrow="Rule set"
        title={name.trim() || "Untitled rule set"}
        form={form}
        onSave={() => void save()}
      >
        <DeleteDialog
          label="Delete rule set"
          title="Delete this rule set?"
          description="All its rules are deleted too. Documents that used it keep their text, but lose the link."
          action={async () => {
            await remove();
            router.push("/library/rules");
          }}
        />
      </DetailHeader>

      <div className="mx-auto grid w-full max-w-3xl gap-5 p-4 sm:p-6">
        <FormSection
          title="Basics"
          description="A named group of rules you can pick on any document."
        >
          <InputField
            control={form.control}
            name="name"
            label="Name"
            max={limits.name}
            autoFocus={set.name.startsWith("Untitled")}
            onFocus={(event) => set.name.startsWith("Untitled") && event.currentTarget.select()}
            placeholder="Client proposals"
            description="Only you see this. Name it by client or publication."
          />
          <TextareaField
            control={form.control}
            name="description"
            label="Description (optional)"
            max={limits.ruleSetDescription}
            autoResize
            className="min-h-20"
            placeholder="House style for proposals to retail clients"
            description="A reminder of when to use this set."
          />
          <div className="sm:max-w-sm">
            <OptionSelect
              label="Spelling"
              hint="Independent of your region, so a US writer can still use British spelling for a UK client."
              value={spelling}
              options={[...spellingOptions]}
              notSetLabel="No preference"
              onChange={(next) =>
                startTransition(async () => {
                  await changeSpelling(next ?? "");
                })
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Banned words"
          description="Words and phrases that never appear. They are flagged in the margin and fixed in one press."
        >
          <RuleSection
            ruleSetId={set.id}
            kind="banned_word"
            title="Banned words"
            placeholder="leverage, synergy, robust"
            rules={of("banned_word")}
            hint="Separate several with commas."
          />
        </FormSection>

        <FormSection
          title="Formats"
          description="How prices, dates and numbers are written."
        >
          <RuleSection
            ruleSetId={set.id}
            kind="format"
            title="Formats"
            placeholder="Prices as £18,400, no decimals"
            rules={of("format")}
            hint="One rule at a time, in plain words."
          />
        </FormSection>

        <FormSection
          title="Other rules"
          description="Anything else that must always or never happen."
        >
          <RuleSection
            ruleSetId={set.id}
            kind="custom"
            title="Other rules"
            placeholder="Never address the reader by first name"
            rules={of("custom")}
            hint="Write it as an instruction."
          />
        </FormSection>
      </div>
    </>
  );
}
