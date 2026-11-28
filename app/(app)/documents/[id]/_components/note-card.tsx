"use client";

import { useEffect, useRef } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, NoteIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { type Note, useNotes } from "~@/editor/extensions/notes";
import { NoteQuote } from "./note-quote";

export function NoteCard({ note }: { note: Note }) {
  const { activeId, anchored, reveal, remove } = useNotes();
  const isActive = activeId === note.id;
  const isDocument = note.quote === null;
  const isAnchored = isDocument || anchored.has(note.id);
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: "nearest" });
  }, [isActive]);
  return (
    <li
      ref={ref}
      className={cn(
        "rounded-md border bg-card transition-colors",
        isActive
          ? "border-primary/60 shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-border",
      )}
    >
      <button
        type="button"
        disabled={isDocument || !isAnchored}
        onClick={() => reveal(note.id)}
        className="block w-full cursor-pointer p-3 text-left disabled:cursor-default"
      >
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <NoteIcon className="size-3 text-primary" />
            {isDocument
              ? "Whole document"
              : isAnchored
                ? "On the document"
                : "Text was removed"}
          </span>
          <span>{note.when}</span>
        </span>
        <span className="mt-2 grid gap-2">
          <NoteQuote>{note.quote}</NoteQuote>
          <span className="block text-sm text-foreground">{note.text}</span>
        </span>
      </button>
      <div className="flex justify-end border-t border-border px-2 py-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => remove(note.id)}
        >
          <CheckIcon />
          Resolve
        </Button>
      </div>
    </li>
  );
}
