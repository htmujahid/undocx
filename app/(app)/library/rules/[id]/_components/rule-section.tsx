"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "~@/components/ui/form-fields";
import { ruleSchema, type RuleKind as AddableKind, type RuleValues } from "~@/lib/context/schemas";
import { Button } from "~@/components/ui/button";
import { PlusIcon } from "~@/components/ui/icons";
import { useAddRule } from "../../query";
import { limits } from "~@/lib/context/limits";
import type { RuleData } from "./rule-types";
import { RuleList } from "./rule-list";

export function RuleSection({
  ruleSetId,
  kind,
  title,
  placeholder,
  rules,
  hint,
}: {
  ruleSetId: string;
  kind: AddableKind;
  title: string;
  placeholder: string;
  rules: RuleData[];
  hint: string;
}) {
  const { trigger: add } = useAddRule(ruleSetId);
  const form = useForm<RuleValues>({ resolver: zodResolver(ruleSchema(kind)), defaultValues: { value: "" } });
  const { isSubmitting, errors } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    const result = await add({ kind, values });
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset();
  });

  return (
    <div className="grid gap-3">
      <RuleList ruleSetId={ruleSetId} rules={rules} />
      <form onSubmit={submit} noValidate className="grid gap-2" onChange={() => form.clearErrors("root.server")}>
        <div className="flex items-start gap-2">
          <InputField control={form.control} name="value" label={`Add to ${title}`} isLabelHidden max={kind === "banned_word" ? limits.ruleValue * 10 : limits.ruleValue} placeholder={placeholder} fieldClassName="min-w-0 flex-1" />
          <Button type="submit" size="md" disabled={isSubmitting}>
            <PlusIcon />
            Add
          </Button>
        </div>
        {errors.root?.server ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            {errors.root.server.message}
          </p>
        ) : (
          <p className="m-0 text-xs text-muted-foreground">{hint}</p>
        )}
      </form>
    </div>
  );
}
