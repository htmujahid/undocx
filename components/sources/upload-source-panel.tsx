"use client";

import { useRef, useState } from "react";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import type { CreatedSource } from "~@/lib/sources/actions";
import { extensionOf, sourceLimits } from "~@/lib/sources/limits";
import { useUploadSource } from "~@/lib/sources/query";
import { Failure } from "./source-failure";

const accept = sourceLimits.extensions.map((extension) => `.${extension}`).join(",");

export function UploadPanel({ documentId, onAdded }: { documentId?: string; onAdded: (source: CreatedSource) => void }) {
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
