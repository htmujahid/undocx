"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { sampleSchema, type SampleValues } from "~@/lib/context/schemas";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon, PlusIcon, XIcon } from "~@/components/ui/icons";
import { useAddSample } from "../../query";
import { countWords, limits } from "~@/lib/context/limits";

export function AddSampleDialog({
  voiceId,
  isFull,
}: {
  voiceId: string;
  isFull: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { trigger: add } = useAddSample(voiceId);
  const form = useForm<SampleValues>({ resolver: zodResolver(sampleSchema), defaultValues: { title: "", content: "" } });
  const content = useWatch({ control: form.control, name: "content" });
  const { isSubmitting, errors } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    const result = await add(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset();
    setOpen(false);
  });

  async function readFile(file: File | undefined) {
    if (!file) return;
    form.setValue("content", (await file.text()).slice(0, limits.sampleContent), { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    if (!form.getValues("title")) form.setValue("title", file.name.replace(/\.[^.]+$/, ""), { shouldDirty: true });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" disabled={isFull} onClick={() => setOpen(true)}>
        <PlusIcon />
        Add sample
      </Button>
      <DialogBackdrop />
      <DialogContent className="w-[min(36rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="grid gap-1">
              <DialogTitle>Add a sample</DialogTitle>
              <DialogDescription>
                Something you wrote and are happy with, as you wrote it.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <XIcon />
            </DialogClose>
          </div>
          <div className="grid gap-4 p-5">
            <InputField control={form.control} name="title" label="Title" max={limits.sampleTitle} placeholder="Proposal, Fenwick Gallery (2025)" />
            <TextareaField
              control={form.control}
              name="content"
              label="Text"
              max={limits.sampleContent}
              rows={9}
              placeholder="Paste it here, or upload a .txt or .md file."
              description={`${countWords(content).toLocaleString()} words. At least ${limits.sampleWordsMin} are needed, and more gives a clearer voice.`}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              hidden
              onChange={(event) => readFile(event.target.files?.[0])}
            />
            {errors.root?.server ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errors.root.server.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border p-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
            >
              Upload a file
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
              Add sample
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
