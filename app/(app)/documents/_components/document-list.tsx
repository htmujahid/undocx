"use client";

import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { FileTextIcon, LockIcon } from "~@/components/ui/icons";
import { useDocuments, type DocumentSummary } from "../query";
import { DocumentActions } from "./document-actions";

function updatedLabel(date: Date) {
  const value = new Date(date);
  const days = Math.floor((Date.now() - value.getTime()) / 86_400_000);
  if (days < 1 && new Date().getDate() === value.getDate()) return `Today, ${value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (days < 2) return "Yesterday";
  return value.toLocaleDateString([], { day: "numeric", month: "long" });
}

export function DocumentList({ initial }: { initial: DocumentSummary[] }) {
  const documents = useDocuments(initial);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Documents</p>
          <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">Everything you are writing.</h1>
        </div>
        <p className="m-0 text-sm text-muted-foreground">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </p>
      </div>

      <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <li key={doc.id} className="group relative flex flex-col justify-between gap-6 rounded-lg border border-border bg-card p-5 transition-colors focus-within:border-primary hover:border-primary">
            <div className="grid gap-2">
              <span className="flex items-center justify-between gap-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
                <span className={doc.status === "ready" ? "text-primary" : undefined}>{doc.status === "ready" ? "Ready to send" : doc.status === "drafting" ? "Setting up" : "Draft"}</span>
                <DocumentActions id={doc.id} title={doc.title} status={doc.status} />
              </span>
              <Link href={doc.status === "drafting" ? `/documents/${doc.id}/setup` : `/documents/${doc.id}`} className="font-serif text-xl leading-tight text-foreground no-underline group-hover:text-primary-deep after:absolute after:inset-0 after:rounded-lg after:content-['']">
                {doc.title}
              </Link>
            </div>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span suppressHydrationWarning>{updatedLabel(doc.updatedAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{doc.wordCount.toLocaleString()} words</span>
              {doc.lockedCount > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <LockIcon className="size-3 text-primary" />
                    {doc.lockedCount} locked
                  </span>
                </>
              ) : null}
            </span>
          </li>
        ))}
        <li>
          <Link href="/documents/new" className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-5 text-center text-sm text-muted-foreground no-underline transition-colors hover:border-primary hover:text-foreground">
            <FileTextIcon className="size-5" />
            New document
            <span className="text-xs text-faint-foreground">Starts with your brief.</span>
          </Link>
        </li>
      </ul>

      <p className="m-0 mt-10 text-sm text-muted-foreground">One person per document. Delete a document and its brief, notes, versions and assistant conversation go with it. Sources stay in your library.</p>
      <Button variant="ghost" size="sm" className="mt-2 -ml-2" render={<Link href="/privacy" />}>
        How your documents are stored
      </Button>
    </div>
  );
}
