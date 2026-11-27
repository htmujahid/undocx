"use client";

import { useEffect, useRef } from "react";
import { useNotes } from "~@/editor/extensions/notes";
import { useDeleteNote, useSaveNote } from "../query";

const DELAY = 800;

export function NotesSync({ id, initial }: { id: string; initial: { id: string; quote: string | null; text: string }[] }) {
  const { notes } = useNotes();
  const { trigger: save } = useSaveNote(id);
  const { trigger: remove } = useDeleteNote(id);
  const synced = useRef(new Map(initial.map((note) => [note.id, `${note.quote ?? ""}\u0000${note.text}`])));
  const saveRef = useRef(save);
  const removeRef = useRef(remove);

  useEffect(() => {
    saveRef.current = save;
    removeRef.current = remove;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = new Map<string, { quote: string | null; text: string }>();
      for (const note of notes) if (!note.isDraft && note.text.trim()) current.set(note.id, { quote: note.quote, text: note.text.trim() });
      for (const [noteId, value] of current) {
        const signature = `${value.quote ?? ""}\u0000${value.text}`;
        if (synced.current.get(noteId) === signature) continue;
        synced.current.set(noteId, signature);
        void saveRef.current({ markId: noteId, quote: value.quote, text: value.text });
      }
      for (const noteId of [...synced.current.keys()]) {
        if (current.has(noteId)) continue;
        synced.current.delete(noteId);
        void removeRef.current(noteId);
      }
    }, DELAY);
    return () => clearTimeout(timer);
  }, [notes]);

  return null;
}
