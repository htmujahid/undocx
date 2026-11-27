"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "~@/components/ui/form-fields";
import { documentLimits } from "~@/lib/documents/limits";
import { titleSchema, type TitleValues } from "~@/lib/documents/schemas";
import { useUpdateTitle } from "../../query";

export function TitleField({ id, title }: { id: string; title: string }) {
  const { trigger } = useUpdateTitle(id);
  const form = useForm<TitleValues>({ resolver: zodResolver(titleSchema), values: { title } });
  const save = form.handleSubmit(
    async (values) => {
      if (values.title === title) return;
      const result = await trigger(values);
      if (result?.error) form.reset({ title });
    },
    () => form.reset({ title }),
  );
  return (
    <InputField
      control={form.control}
      name="title"
      label="Document title"
      isLabelHidden
      max={documentLimits.title}
      fieldClassName="min-w-0 flex-1"
      className="h-8 border-transparent bg-transparent text-center text-[0.9375rem] font-medium text-foreground hover:border-input focus-visible:border-input"
      onBlur={() => void save()}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          form.reset({ title });
          event.currentTarget.blur();
        }
      }}
    />
  );
}
