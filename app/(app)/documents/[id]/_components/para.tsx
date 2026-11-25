"use client";

import { useState, type ReactNode } from "react";
import { cn } from "~@/lib/utils";
import { LockMark, NoteMark } from "./margin";

export function Para({ children, isLocked: defaultLocked = false, isActive, noteId }: { children: ReactNode; isLocked?: boolean; isActive?: boolean; noteId?: string }) {
  const [isLocked, setIsLocked] = useState(defaultLocked);
  return (
    <div
      className={cn("group relative -mx-3 rounded-md px-3 py-1", isActive && "bg-primary/5")}
      data-locked={isLocked || undefined}
    >
      <p className="m-0 text-doc text-foreground" contentEditable={isLocked ? false : undefined}>
        {children}
      </p>
      <span className="absolute top-0.5 -right-20 flex items-center gap-1 xl:flex" contentEditable={false}>
        <LockMark isLocked={isLocked} onLockedChange={setIsLocked} />
        {noteId ? <NoteMark id={noteId} /> : null}
      </span>
    </div>
  );
}
