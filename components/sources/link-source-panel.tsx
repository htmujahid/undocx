"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import type { CreatedSource } from "~@/lib/sources/actions";
import { sourceLimits } from "~@/lib/sources/limits";
import { useCreateLinkSource } from "~@/lib/sources/query";
import { linkSourceSchema, type LinkSourceValues } from "~@/lib/sources/schemas";
import { Failure } from "./source-failure";

export function LinkPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
  const { trigger } = useCreateLinkSource(documentId);
  const form = useForm<LinkSourceValues>({ resolver: zodResolver(linkSourceSchema), defaultValues: { title: "", url: "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger(values);
    if ("error" in result) return form.setError("root.server", { message: result.error });
    onAdded(result.source);
  });
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <InputField control={form.control} name="title" label="Title" max={sourceLimits.title} placeholder="Shopify analytics, Jan to Dec 2025" />
      <InputField control={form.control} name="url" label="Link" inputMode="url" placeholder="https://" description="Undocx does not read the page. It cites the link and its title." />
      <Failure message={errors.root?.server?.message ?? null} />
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          Add link
        </Button>
      </div>
    </form>
  );
}
