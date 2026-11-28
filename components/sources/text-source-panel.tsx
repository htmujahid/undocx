"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import type { CreatedSource } from "~@/lib/sources/actions";
import { sourceLimits } from "~@/lib/sources/limits";
import { useCreateTextSource } from "~@/lib/sources/query";
import { textSourceSchema, type TextSourceValues } from "~@/lib/sources/schemas";
import { Failure } from "./source-failure";

export function TextPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
  const { trigger } = useCreateTextSource(documentId);
  const form = useForm<TextSourceValues>({ resolver: zodResolver(textSourceSchema), defaultValues: { title: "", content: "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger(values);
    if ("error" in result) return form.setError("root.server", { message: result.error });
    onAdded(result.source);
  });
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <InputField control={form.control} name="title" label="Title" max={sourceLimits.title} placeholder="Staff interview notes" />
      <TextareaField control={form.control} name="content" label="Text" max={sourceLimits.content} rows={8} placeholder="Paste the text Undocx should use." />
      <Failure message={errors.root?.server?.message ?? null} />
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          Add text
        </Button>
      </div>
    </form>
  );
}
