"use client";

import type { Control } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { limits } from "~@/lib/context/limits";
import type { VoiceValues } from "~@/lib/context/schemas";

export function VoiceFields({ control, autoFocus = false }: { control: Control<VoiceValues>; autoFocus?: boolean }) {
  return (
    <>
      <InputField control={control} name="name" label="Name" max={limits.name} autoFocus={autoFocus} placeholder="Plain and warm" description="Only you see this. Name it by register, such as plain and warm." />
      <TextareaField
        control={control}
        name="notes"
        label="Notes (optional)"
        max={limits.voiceNotes}
        autoResize
        className="min-h-20"
        placeholder="Short sentences. Numbers first. Never salesy."
        description="Anything the samples do not show on their own."
      />
    </>
  );
}
