"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, NoteIcon } from "~@/components/ui/icons";
import { SidebarContent, SidebarFooter } from "~@/components/ui/sidebar";
import { cn } from "~@/lib/utils";
import { type Note, useNotes } from "~@/editor/extensions/notes";

export function NotesTab() {
  const { notes } = useNotes();
  return (
    <>
      <SidebarContent className="px-4 py-4">
        {notes.length > 0 ? (
          <ol className="m-0 grid list-none gap-3 p-0">
            {notes.map((note) =>
              note.isDraft ? (
                <DraftCard key={note.id} note={note} />
              ) : (
                <NoteCard key={note.id} note={note} />
              ),
            )}
          </ol>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            No notes on this document.
          </p>
        )}
        <p className="m-0 mt-4 text-xs text-muted-foreground">
          Notes are yours alone. To attach one to a passage, select the text
          and choose Add a note.
        </p>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DocumentNoteForm />
      </SidebarFooter>
    </>
  );
}

function DocumentNoteForm() {
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

function Quote({ children }: { children: string | null }) {
  if (children === null) return null;
  return (
    <span className="line-clamp-2 border-l-2 border-primary/50 pl-2 text-sm text-muted-foreground italic">
      {children}
    </span>
  );
}

function DraftCard({ note }: { note: Note }) {
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
        <Quote>{note.quote}</Quote>
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

function NoteCard({ note }: { note: Note }) {
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
          <Quote>{note.quote}</Quote>
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
