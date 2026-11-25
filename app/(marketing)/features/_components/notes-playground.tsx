"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, NoteIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { MarginRow, SectionLabel, Sheet, SheetChrome, SheetPage, paragraphClass } from "../../_components/doc";

const title = "Proposal: a new online store for Marlow & Finch";

const paragraphs = [
  { id: "p1", where: "§3 ¶1", text: "Checkout. We will replace the six-step checkout with a two-step flow: one screen for delivery and one for payment. Guest checkout by default, with an account offered after the order rather than before it." },
  { id: "p2", where: "§3 ¶2", text: "Catalogue. Search first, with the box at the top of every page. Results show cover, price and whether the copy is on the shelf today. Browsing by shelf mirrors the shop's own sections, starting with the staff picks table by the door." },
  { id: "p3", where: "§3 ¶3", text: "Order emails. Today's confirmation email comes from the payment provider and never names the shop. We will write and design three emails: order confirmed, order posted, and order ready to collect." },
];

type Note = { id: string; paragraphId: string; text: string; when: string };

export function NotesPlayground() {
  const [notes, setNotes] = useState<Note[]>([{ id: "n1", paragraphId: "p2", text: "Check with Ruth whether the staff picks table is staying by the door after the refit.", when: "Yesterday" }]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftFor, setDraftFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const addNote = () => {
    if (!draftFor || draft.trim() === "") return;
    const note = { id: `n${Date.now()}`, paragraphId: draftFor, text: draft.trim(), when: "Just now" };
    setNotes((current) => [...current, note]);
    setActiveId(note.id);
    setDraftFor(null);
    setDraft("");
  };

  return (
    <Sheet>
      <SheetChrome title={title}>
        <span>Draft · 3 of 6</span>
      </SheetChrome>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_16rem]">
        <SheetPage>
          <SectionLabel number="3">Scope of work</SectionLabel>
          {paragraphs.map((paragraph) => {
            const note = notes.find((item) => item.paragraphId === paragraph.id);
            return (
              <MarginRow
                key={paragraph.id}
                mark={
                  note ? (
                    <button
                      type="button"
                      aria-label="Show note"
                      aria-pressed={activeId === note.id}
                      onClick={() => setActiveId(note.id)}
                      className={cn("inline-flex size-6 items-center justify-center rounded-md text-primary-deep outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring", activeId === note.id ? "bg-primary/15" : "bg-primary/10 hover:bg-primary/15")}
                    >
                      <NoteIcon className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Add a note on ${paragraph.where}`}
                      aria-pressed={draftFor === paragraph.id}
                      onClick={() => {
                        setDraftFor(paragraph.id);
                        setActiveId(null);
                      }}
                      className={cn("inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring", draftFor === paragraph.id && "bg-muted text-foreground")}
                    >
                      <NoteIcon className="size-3.5" />
                    </button>
                  )
                }
              >
                <p className={paragraphClass}>{paragraph.text}</p>
              </MarginRow>
            );
          })}
        </SheetPage>
        <aside aria-label="Notes" className="flex flex-col border-t border-border bg-background md:border-t-0 md:border-l">
          <h3 className="m-0 flex h-10 items-center gap-2 border-b border-border px-4 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Notes
            {notes.length > 0 ? <span className="rounded-sm bg-muted px-1 font-sans text-[0.65rem] tracking-normal tabular-nums">{notes.length}</span> : null}
          </h3>
          <div className="flex-1 p-3">
            {notes.length > 0 ? (
              <ol className="m-0 grid list-none gap-2 p-0">
                {notes.map((note) => {
                  const where = paragraphs.find((paragraph) => paragraph.id === note.paragraphId)?.where;
                  const isActive = activeId === note.id;
                  return (
                    <li key={note.id} className={cn("rounded-md border bg-card text-sm", isActive ? "border-primary/60 shadow-[0_0_0_1px_var(--color-primary)]" : "border-border")}>
                      <button type="button" onClick={() => setActiveId(note.id)} className="block w-full p-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring">
                        <span className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <NoteIcon className="size-3 text-primary" />
                            {where}
                          </span>
                          <span>{note.when}</span>
                        </span>
                        <span className="mt-1.5 block text-foreground">{note.text}</span>
                      </button>
                      <div className="flex justify-end border-t border-border px-2 py-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))}>
                          <CheckIcon />
                          Resolve
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="m-0 text-sm text-muted-foreground">No notes. Press the mark beside a paragraph to add one.</p>
            )}
          </div>
          {draftFor ? (
            <form
              className="border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                addNote();
              }}
            >
              <label htmlFor="playground-note" className="mb-1 block text-xs text-muted-foreground">
                Note on {paragraphs.find((paragraph) => paragraph.id === draftFor)?.where}
              </label>
              <textarea id="playground-note" rows={2} autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Only you will see this." className="w-full resize-none rounded-md border border-input bg-card px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring" />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="primary" type="submit" disabled={draft.trim() === ""}>
                  Add note
                </Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => setDraftFor(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="m-0 border-t border-border p-3 text-xs text-muted-foreground">Notes never export and no reader sees them.</p>
          )}
        </aside>
      </div>
    </Sheet>
  );
}
