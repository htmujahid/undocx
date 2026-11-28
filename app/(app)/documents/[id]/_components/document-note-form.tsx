"use client";

import { useState, type FormEvent } from "react";
import { Button } from "~@/components/ui/button";
import { NoteIcon } from "~@/components/ui/icons";
import { useNotes } from "~@/editor/extensions/notes";

export function DocumentNoteForm() {
  const { addToDocument } = useNotes();
  const [text, setText] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    addToDocument(text);
    setText("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-md border border-input bg-card p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
    >
      <label htmlFor="document-note" className="sr-only">
        Note on the whole document
      </label>
      <textarea
        id="document-note"
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
            event.currentTarget.form?.requestSubmit();
        }}
        placeholder="Note on the whole document…"
        className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground"
      />
      <Button
        size="icon"
        variant="secondary"
        aria-label="Add document note"
        type="submit"
        disabled={!text.trim()}
      >
        <NoteIcon />
      </Button>
    </form>
  );
}
