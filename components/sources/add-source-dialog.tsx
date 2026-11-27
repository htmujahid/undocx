"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon, XIcon } from "~@/components/ui/icons";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import type { CreatedSource } from "~@/lib/sources/actions";
import { extensionOf, sourceLimits } from "~@/lib/sources/limits";
import { useAttachSource, useCreateLinkSource, useCreateTextSource, useSources, useUploadSource } from "~@/lib/sources/query";
import { linkSourceSchema, textSourceSchema, type LinkSourceValues, type TextSourceValues } from "~@/lib/sources/schemas";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
  attachedIds?: string[];
  onAdded: (source: CreatedSource) => void;
};

const accept = sourceLimits.extensions.map((extension) => `.${extension}`).join(",");

function Failure({ message }: { message: string | null }) {
  return message ? (
    <p className="m-0 text-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

function UploadPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
  const { trigger, isMutating } = useUploadSource(documentId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  function choose(next: File | undefined) {
    setProblem(null);
    if (!next) return;
    if (!(sourceLimits.extensions as readonly string[]).includes(extensionOf(next.name))) return setProblem(`Upload one of: ${sourceLimits.extensions.join(", ")}.`);
    if (next.size > sourceLimits.bytes) return setProblem(`Files can be up to ${sourceLimits.bytes / 1024 / 1024} MB.`);
    setFile(next);
  }

  async function submit() {
    if (!file) return setProblem("Choose a file first.");
    setProblem(null);
    try {
      const result = await trigger({ file, title });
      onAdded(result.source);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "The file could not be uploaded.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <input ref={inputRef} type="file" accept={accept} hidden aria-label="File" onChange={(event) => choose(event.target.files?.[0])} />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} className="justify-self-start">
          {file ? "Choose a different file" : "Choose a file"}
        </Button>
        <p className="m-0 text-xs text-muted-foreground">{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : `${sourceLimits.extensions.join(", ")}. Up to ${sourceLimits.bytes / 1024 / 1024} MB. Undocx reads the text so it can use and cite it.`}</p>
      </div>
      <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Title (optional)
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={sourceLimits.title} placeholder="Defaults to the file name" className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm font-normal text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring" />
      </label>
      <Failure message={problem} />
      <div className="flex justify-end">
        <Button type="button" variant="primary" disabled={isMutating || !file} onClick={() => void submit()}>
          {isMutating ? <LoaderCircleIcon className="animate-spin" /> : null}
          Add file
        </Button>
      </div>
    </div>
  );
}

function TextPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
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

function LinkPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
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

function LibraryPanel({ documentId, attachedIds, onAdded }: { documentId: string; attachedIds: string[]; onAdded: (source: CreatedSource) => void }) {
  const { data = [], isLoading } = useSources();
  const { trigger, isMutating } = useAttachSource(documentId);
  const [problem, setProblem] = useState<string | null>(null);
  const available = data.filter((item) => !attachedIds.includes(item.id));

  async function attach(item: (typeof data)[number]) {
    setProblem(null);
    const result = await trigger(item.id);
    if (result && "error" in result && result.error) return setProblem(result.error);
    onAdded({ id: item.id, kind: item.kind, title: item.title, url: item.url });
  }

  if (isLoading) return <p className="m-0 text-sm text-muted-foreground">Loading your library…</p>;
  if (available.length === 0) return <p className="m-0 text-sm text-muted-foreground">{data.length === 0 ? "Your library has no sources yet. Upload a file, paste text or add a link." : "Everything in your library is already in this document."}</p>;
  return (
    <div className="grid gap-3">
      <ul className="m-0 grid max-h-72 list-none gap-1 overflow-y-auto p-0">
        {available.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
            <span className="grid min-w-0">
              <span className="truncate text-sm text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.kind === "link" ? "Link" : `${item.wordCount.toLocaleString()} words`}</span>
            </span>
            <Button size="sm" variant="secondary" disabled={isMutating} onClick={() => void attach(item)}>
              Add
            </Button>
          </li>
        ))}
      </ul>
      <Failure message={problem} />
    </div>
  );
}

export function AddSourceDialog({ open, onOpenChange, documentId, attachedIds = [], onAdded }: Props) {
  const hasLibrary = Boolean(documentId);
  const handleAdded = (source: CreatedSource) => {
    onAdded(source);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(34rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="grid gap-1">
            <DialogTitle>Add a source</DialogTitle>
            <DialogDescription>Something Undocx can read and cite.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <Tabs defaultValue={hasLibrary ? "library" : "upload"} className="grid gap-4 p-5">
          <TabsList aria-label="Source type">
            {hasLibrary ? <TabsTab value="library">Library</TabsTab> : null}
            <TabsTab value="upload">Upload</TabsTab>
            <TabsTab value="text">Paste text</TabsTab>
            <TabsTab value="link">Link</TabsTab>
          </TabsList>
          {hasLibrary && documentId ? (
            <TabsPanel value="library">
              <LibraryPanel documentId={documentId} attachedIds={attachedIds} onAdded={handleAdded} />
            </TabsPanel>
          ) : null}
          <TabsPanel value="upload">
            <UploadPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
          <TabsPanel value="text">
            <TextPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
          <TabsPanel value="link">
            <LinkPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
