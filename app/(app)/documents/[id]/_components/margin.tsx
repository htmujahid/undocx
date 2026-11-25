"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, LockIcon, LockOpenIcon, NoteIcon } from "~@/components/ui/icons";
import { usePanel } from "./panel-context";
import { Toggle } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { cn } from "~@/lib/utils";

export function LockMark({ isLocked, onLockedChange }: { isLocked: boolean; onLockedChange: (isLocked: boolean) => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            pressed={isLocked}
            onPressedChange={onLockedChange}
            aria-label={isLocked ? "Unlock paragraph" : "Lock paragraph as final"}
            className={cn("size-7 justify-center border-0 bg-transparent px-0 data-pressed:bg-transparent", isLocked ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
          />
        }
      >
        {isLocked ? <LockIcon className="size-3.5" /> : <LockOpenIcon className="size-3.5" />}
      </TooltipTrigger>
      <TooltipContent side="left">{isLocked ? "Final. Rewrites skip this paragraph." : "Lock as final"}</TooltipContent>
    </Tooltip>
  );
}

export function NoteMark({ id }: { id: string }) {
  const { notes, activeNoteId, showNote } = usePanel();
  if (!notes.some((note) => note.id === id)) return null;
  const isActive = activeNoteId === id;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label="Show note"
            aria-pressed={isActive}
            onClick={() => showNote(id)}
            className={cn("size-7 text-primary-deep hover:bg-primary/10", isActive ? "bg-primary/15" : "bg-primary/10")}
          />
        }
      >
        <NoteIcon className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="left">Note to self. Opens in the Notes tab.</TooltipContent>
    </Tooltip>
  );
}

export function RewriteReview({ before, after, instruction }: { before: string; after: string; instruction: string }) {
  const [state, setState] = useState<"pending" | "kept" | "undone">("pending");
  return (
    <div className="-mx-3 rounded-md bg-primary/5 px-3 py-2" contentEditable={false}>
      <p className="m-0 mb-2 flex items-baseline gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-primary">{state === "pending" ? "Rewritten with" : state === "kept" ? "Kept" : "Undone"}</span>
        <span className="font-serif text-sm text-foreground italic">“{instruction}”</span>
      </p>
      <p className="m-0 text-doc text-foreground" contentEditable suppressContentEditableWarning>
        {state === "pending" ? (
          <>
            <del className="text-faint-foreground line-through decoration-faint-foreground decoration-1">{before}</del>{" "}
            <ins className="underline decoration-primary decoration-2 underline-offset-[0.16em] [text-decoration-skip-ink:none]">{after}</ins>
          </>
        ) : state === "kept" ? (
          after
        ) : (
          before
        )}
      </p>
      <div className="mt-2 flex gap-2">
        {state === "pending" ? (
          <>
            <Button size="sm" variant="primary" onClick={() => setState("kept")}>
              <CheckIcon />
              Keep
            </Button>
            <Button size="sm" onClick={() => setState("undone")}>
              Undo
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setState("pending")}>
            Show diff again
          </Button>
        )}
      </div>
    </div>
  );
}
