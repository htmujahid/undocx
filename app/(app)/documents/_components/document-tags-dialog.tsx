"use client";

import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon, PlusIcon, XIcon } from "~@/components/ui/icons";
import { Input } from "~@/components/ui/input";
import { organizeLimits } from "~@/lib/documents/limits";
import { useSetTags } from "../query";

export function DocumentTagsDialog({ id, title, current, suggestions, onClose }: { id: string; title: string; current: string[]; suggestions: string[]; onClose: () => void }) {
  const { trigger } = useSetTags(id);
  const [tags, setTags] = useState(current);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const has = (name: string) => tags.some((tag) => tag.toLowerCase() === name.toLowerCase());
  const isFull = tags.length >= organizeLimits.tagsPerDocument;
  const open = suggestions.filter((name) => !has(name));

  function add(raw: string) {
    const name = raw.trim().slice(0, organizeLimits.tagName);
    if (name && !has(name) && !isFull) setTags((previous) => [...previous, name]);
    setText("");
  }

  async function save() {
    setIsSaving(true);
    const result = await trigger(tags);
    setIsSaving(false);
    if (result?.error) setError(result.error);
    else onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(28rem,calc(100vw-2rem))]">
        <div className="grid gap-4 p-5">
          <div className="grid gap-2">
            <DialogTitle>Tags for {title}</DialogTitle>
            <DialogDescription>Short labels to find documents by. Up to {organizeLimits.tagsPerDocument} per document.</DialogDescription>
          </div>
          {tags.length > 0 ? (
            <ul aria-label="Current tags" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {tags.map((tag) => (
                <li key={tag.toLowerCase()} className="inline-flex items-center gap-1 rounded-full border border-border bg-card py-0.5 pr-1 pl-2.5 text-xs text-foreground">
                  {tag}
                  <button type="button" aria-label={`Remove tag ${tag}`} className="flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setTags((previous) => previous.filter((item) => item !== tag))}>
                    <XIcon className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              add(text);
            }}
          >
            <Input aria-label="Add a tag" value={text} onValueChange={setText} maxLength={organizeLimits.tagName} disabled={isFull} placeholder={isFull ? "Tag limit reached" : "Add a tag"} autoFocus />
            <Button type="submit" variant="secondary" disabled={isFull || !text.trim()}>
              <PlusIcon />
              Add
            </Button>
          </form>
          {open.length > 0 ? (
            <div className="grid gap-1.5">
              <p className="m-0 text-xs text-muted-foreground">Your other tags</p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {open.map((name) => (
                  <li key={name}>
                    <button type="button" disabled={isFull} className="cursor-pointer rounded-full border border-dashed border-input px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50" onClick={() => add(name)}>
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {error ? (
            <p className="m-0 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
          <Button variant="primary" disabled={isSaving} onClick={() => void save()}>
            {isSaving ? <LoaderCircleIcon className="animate-spin" /> : null}
            Save tags
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
