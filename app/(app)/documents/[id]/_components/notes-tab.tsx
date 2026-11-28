"use client";

import { SidebarContent, SidebarFooter } from "~@/components/ui/sidebar";
import { useNotes } from "~@/editor/extensions/notes";
import { DocumentNoteForm } from "./document-note-form";
import { DraftCard } from "./draft-note-card";
import { NoteCard } from "./note-card";

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

