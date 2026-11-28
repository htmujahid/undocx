import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { FileTextIcon, FolderSimpleIcon, LockIcon } from "~@/components/ui/icons";
import { defaultListQuery, listHref, type ListQuery } from "~@/lib/documents/list-query";
import { DocumentActions } from "./document-actions";
import { DocumentPagination } from "./document-pagination";
import { DocumentsToolbar } from "./documents-toolbar";
import { FolderRail } from "./folder-rail";

type Counted = { id: string; name: string; documents: number };

type Item = {
  id: string;
  title: string;
  status: "drafting" | "draft" | "ready";
  wordCount: number;
  lockedCount: number;
  updatedAt: Date;
  folderId: string | null;
  tags: { id: string; name: string }[];
};

type Props = {
  query: ListQuery;
  result: { items: Item[]; total: number; page: number; pageCount: number };
  folders: Counted[];
  tags: Counted[];
  counts: { all: number; unfiled: number };
};

function updatedLabel(date: Date) {
  const value = new Date(date);
  const days = Math.floor((Date.now() - value.getTime()) / 86_400_000);
  if (days < 1 && new Date().getDate() === value.getDate()) return `Today, ${value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (days < 2) return "Yesterday";
  return value.toLocaleDateString([], { day: "numeric", month: "long" });
}

function isFiltered(query: ListQuery) {
  return Boolean(query.q) || query.folder !== defaultListQuery.folder || query.tag !== null;
}

export function DocumentList({ query, result, folders, tags, counts }: Props) {
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]));
  const folderOptions = folders.map(({ id, name }) => ({ id, name }));
  const tagNames = tags.map((tag) => tag.name);
  const filtered = isFiltered(query);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Documents</p>
          <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">Everything you are writing.</h1>
        </div>
        <p className="m-0 text-sm text-muted-foreground" aria-live="polite">
          {result.total} {result.total === 1 ? "document" : "documents"}
          {filtered ? " found" : ""}
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)]">
        <FolderRail query={query} folders={folders} tags={tags} counts={counts} />
        <div className="grid min-w-0 content-start gap-6">
          <DocumentsToolbar query={query} />

          {result.items.length === 0 ? (
            <div className="grid justify-items-start gap-3 rounded-lg border border-dashed border-input p-8">
              <p className="m-0 text-sm text-foreground">{filtered ? "No documents match." : "You have no documents yet."}</p>
              {filtered ? (
                <Button variant="secondary" size="sm" render={<Link href={listHref(defaultListQuery)} />}>
                  Clear search and filters
                </Button>
              ) : (
                <Button variant="primary" size="sm" render={<Link href="/documents/new" />}>
                  <FileTextIcon />
                  New document
                </Button>
              )}
            </div>
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
              {result.items.map((doc) => (
                <li key={doc.id} className="group relative flex flex-col justify-between gap-6 rounded-lg border border-border bg-card p-5 transition-colors focus-within:border-primary hover:border-primary">
                  <div className="grid gap-2">
                    <span className="flex items-center justify-between gap-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
                      <span className={doc.status === "ready" ? "text-primary" : undefined}>{doc.status === "ready" ? "Ready to send" : doc.status === "drafting" ? "Setting up" : "Draft"}</span>
                      <DocumentActions id={doc.id} title={doc.title} status={doc.status} folderId={doc.folderId} folders={folderOptions} tags={doc.tags.map((tag) => tag.name)} allTags={tagNames} />
                    </span>
                    <Link href={doc.status === "drafting" ? `/documents/${doc.id}/setup` : `/documents/${doc.id}`} className="font-serif text-xl leading-tight text-foreground no-underline group-hover:text-primary-deep after:absolute after:inset-0 after:rounded-lg after:content-['']">
                      {doc.title}
                    </Link>
                    {doc.folderId || doc.tags.length > 0 ? (
                      <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {doc.folderId ? (
                          <span className="inline-flex items-center gap-1">
                            <FolderSimpleIcon className="size-3" />
                            {folderNames.get(doc.folderId)}
                          </span>
                        ) : null}
                        {doc.tags.map((tag) => (
                          <span key={tag.id} className="rounded-full border border-border px-2 py-0.5">
                            {tag.name}
                          </span>
                        ))}
                      </span>
                    ) : null}
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
            </ul>
          )}

          <DocumentPagination query={query} page={result.page} pageCount={result.pageCount} />
        </div>
      </div>

      <p className="m-0 mt-10 text-sm text-muted-foreground">One person per document. Delete a document and its brief, notes, versions and assistant conversation go with it. Sources stay in your library.</p>
      <Button variant="ghost" size="sm" className="mt-2 -ml-2" render={<Link href="/privacy" />}>
        How your documents are stored
      </Button>
    </div>
  );
}
