"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { versionLimits } from "~@/lib/documents/limits";
import { versionNameSchema, type VersionNameValues } from "~@/lib/documents/schemas";
import { useSaveVersion } from "../versions/query";

export function VersionSaveForm({ documentId, nextNumber }: { documentId: string; nextNumber: number }) {
  const [editor] = useLexicalComposerContext();
  const { trigger } = useSaveVersion(documentId);
  const form = useForm<VersionNameValues>({ resolver: zodResolver(versionNameSchema), defaultValues: { name: "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger({ kind: "manual", name: values.name, content: JSON.stringify(editor.getEditorState().toJSON()) });
    if ("error" in result) return form.setError("root.server", { message: result.error });
    form.reset();
  });
  return (
    <form onSubmit={submit} noValidate className="grid gap-2 rounded-md border border-border bg-card p-3">
      <InputField control={form.control} name="name" label="Name this version (optional)" max={versionLimits.name} placeholder="Sent to Ruth" description={`Saved as version ${nextNumber}. Without a name it is just the number.`} />
      {errors.root?.server ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
        Save version
      </Button>
    </form>
  );
}
