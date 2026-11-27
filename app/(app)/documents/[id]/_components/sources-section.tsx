"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { normalizeUrl } from "~@/editor/plugins/link";
import { useSources, type Source } from "~@/editor/extensions/sources";
import { Button } from "~@/components/ui/button";
import { ExternalLinkIcon, PlusIcon, XIcon } from "~@/components/ui/icons";
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "~@/components/ui/sidebar";
import { cn } from "~@/lib/utils";
import { usePanel } from "~@/editor/extensions/panel";

export function SourcesSection() {
  const { sources, order, counts, activeId, remove, reveal } = useSources();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const cited = order.flatMap((id) => sources.find((source) => source.id === id) ?? []);
  const uncited = sources.filter((source) => !counts.has(source.id));
  const rows = [...cited.map((source, index) => ({ source, number: index + 1 })), ...uncited.map((source) => ({ source, number: null }))];

  return (
    <>
      {rows.length > 0 ? (
        <SidebarMenu>
          {rows.map(({ source, number }) => {
            const count = counts.get(source.id) ?? 0;
            if (confirmId === source.id) {
              return (
                <SidebarMenuItem key={source.id}>
                  <div className="grid gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm">
                    <p className="m-0 text-foreground">
                      Remove “{source.title}” and its {count} {count === 1 ? "citation" : "citations"}?
                    </p>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                        Keep
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          remove(source.id);
                          setConfirmId(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              );
            }
            return (
              <SidebarMenuItem key={source.id} className="group/menu-item">
                <SidebarMenuButton
                  isActive={activeId === source.id}
                  disabled={count === 0}
                  onClick={() => reveal(source.id)}
                  tooltip={count > 0 ? `${source.title}: jump to the citation` : `${source.title}: not cited yet`}
                  className={cn("h-auto items-start py-1.5 pr-14", count === 0 && "cursor-default")}
                >
                  <span className={cn("mt-px w-4 shrink-0 text-center font-medium tabular-nums", number ? "text-primary" : "text-faint-foreground")}>{number ?? "–"}</span>
                  <span className="grid min-w-0 gap-0.5">
                    <span className="truncate">{source.title}</span>
                    <span className="text-xs text-muted-foreground">{count > 0 ? `Cited ${count} ${count === 1 ? "time" : "times"}` : "Not cited yet"}</span>
                  </span>
                </SidebarMenuButton>
                {source.url ? (
                  <SidebarMenuAction render={<a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${source.title}`} />} className="right-7" showOnHover>
                    <ExternalLinkIcon />
                  </SidebarMenuAction>
                ) : null}
                <SidebarMenuAction aria-label={`Remove ${source.title}`} showOnHover onClick={() => (count > 0 ? setConfirmId(source.id) : remove(source.id))}>
                  <XIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      ) : (
        <p className="m-0 px-2 text-sm text-muted-foreground">No sources yet. Add one, then cite it from selected text.</p>
      )}
      <AddSource />
    </>
  );
}

function AddSource() {
  const { add } = useSources();
  const { sourceForm: open, setSourceForm: setOpen } = usePanel();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setTitle("");
    setLink("");
    setError(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    const url = link.trim() ? normalizeUrl(link) : undefined;
    if (url === null) {
      setError("That link doesn’t look right.");
      return;
    }
    add(title, url);
    close();
  }

  if (!open) {
    return (
      <div className="px-2 pt-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <PlusIcon />
          Add a source
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onKeyDown={(event) => event.key === "Escape" && close()} className="mx-2 mt-2 grid gap-2 rounded-md border border-input bg-card p-2">
      <label htmlFor="source-title" className="sr-only">
        Source title
      </label>
      <input
        ref={field}
        id="source-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title, e.g. Sales export 2025.xlsx"
        className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      />
      <label htmlFor="source-link" className="sr-only">
        Link (optional)
      </label>
      <input
        id="source-link"
        value={link}
        onChange={(event) => {
          setLink(event.target.value);
          setError(null);
        }}
        placeholder="Link (optional)"
        inputMode="url"
        aria-invalid={error ? true : undefined}
        className="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-invalid:border-destructive"
      />
      {error ? (
        <p role="alert" className="m-0 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" type="button" onClick={close}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" type="submit" disabled={!title.trim()}>
          Add source
        </Button>
      </div>
    </form>
  );
}

export type { Source };
