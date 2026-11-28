"use client";

import type { ReactNode } from "react";
import type { Control } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { limits } from "~@/lib/context/limits";
import type { RuleSetValues } from "~@/lib/context/schemas";

export function RuleSetFields({ control, autoFocus = false, children }: { control: Control<RuleSetValues>; autoFocus?: boolean; children?: ReactNode }) {
  return (
    <>
      <InputField control={control} name="name" label="Name" max={limits.name} autoFocus={autoFocus} placeholder="Client proposals" description="Only you see this. Name it by client or publication." />
      <TextareaField
        control={control}
        name="description"
        label="Description (optional)"
        max={limits.ruleSetDescription}
        autoResize
        className="min-h-20"
        placeholder="House style for proposals to retail clients"
        description="A reminder of when to use this set."
      />
      {children}
    </>
  );
}
