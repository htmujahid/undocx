"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "~@/components/ui/button";
import { NoteIcon } from "~@/components/ui/icons";
import { type Note, useNotes } from "~@/editor/extensions/notes";
import { NoteQuote } from "./note-quote";

export function DraftCard({ note }: { note: Note }) {
  const { save, remove } = useNotes();
  const [text, setText] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => field.current?.focus(), []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim()) save(note.id, text);
  }

  return (
    <li className="rounded-md border border-primary/60 bg-card shadow-[0_0_0_1px_var(--color-primary)]">
      <form onSubmit={submit} className="grid gap-2 p-3">
        <NoteQuote>{note.quote}</NoteQuote>
        <label htmlFor={`note-${note.id}`} className="sr-only">
          Note
        </label>
        <textarea
          ref={field}
          id={`note-${note.id}`}
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") remove(note.id);
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
              event.currentTarget.form?.requestSubmit();
          }}
          placeholder="Write a note to yourself…"
          className="min-w-0 resize-none rounded-md border border-input bg-background p-2 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => remove(note.id)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            type="submit"
            disabled={!text.trim()}
          >
            <NoteIcon />
            Save note
          </Button>
        </div>
      </form>
    </li>
  );
}
