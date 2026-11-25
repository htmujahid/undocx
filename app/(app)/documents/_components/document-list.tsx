import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { FileTextIcon, LockIcon } from "~@/components/ui/icons";
import { documentHref, documents, newDocumentHref } from "./documents";

export function DocumentList() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Documents</p>
          <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">Everything you are writing.</h1>
        </div>
        <p className="m-0 text-sm text-muted-foreground">
          {documents.length} of 5 on the free plan.{" "}
          <Link href="/pricing" className="text-foreground underline-offset-[0.2em] hover:text-primary-deep hover:underline">
            Pro removes the limit.
          </Link>
        </p>
      </div>

      <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <li key={doc.id}>
            <Link href={documentHref(doc)} className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-border bg-card p-5 no-underline transition-colors hover:border-primary">
              <div className="grid gap-2">
                <span className="flex items-center justify-between font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
                  <span>{doc.kind}</span>
                  <span className={doc.status === "ready" ? "text-primary" : undefined}>{doc.status === "ready" ? "Ready to send" : "Draft"}</span>
                </span>
                <span className="font-serif text-xl leading-tight text-foreground group-hover:text-primary-deep">{doc.title}</span>
              </div>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{doc.updated}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.words.toLocaleString()} words</span>
                {doc.locked > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <LockIcon className="size-3 text-primary" />
                      {doc.locked} locked
                    </span>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <span>
                  {doc.sources} {doc.sources === 1 ? "source" : "sources"}
                </span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link href={newDocumentHref} className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-5 text-center text-sm text-muted-foreground no-underline transition-colors hover:border-primary hover:text-foreground">
            <FileTextIcon className="size-5" />
            New document
            <span className="text-xs text-faint-foreground">Starts with the brief.</span>
          </Link>
        </li>
      </ul>

      <p className="m-0 mt-10 text-sm text-muted-foreground">One person per document. Delete a document and its brief, outline, sources and notes go with it.</p>
      <Button variant="ghost" size="sm" className="mt-2 -ml-2" render={<Link href="/privacy" />}>
        How your documents are stored
      </Button>
    </div>
  );
}
