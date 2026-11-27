"use client";

import { useState } from "react";
import { AddSourceDialog } from "~@/components/sources/add-source-dialog";
import { useDetachSource } from "~@/lib/sources/query";
import { useSources, type Source } from "~@/editor/extensions/sources";
import { Button } from "~@/components/ui/button";
import { ExternalLinkIcon, PlusIcon, XIcon } from "~@/components/ui/icons";
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "~@/components/ui/sidebar";
import { cn } from "~@/lib/utils";
import { usePanel } from "~@/editor/extensions/panel";

export function SourcesSection({ documentId }: { documentId: string }) {
  const { sources, order, counts, activeId, remove, reveal } = useSources();
  const { trigger: detach } = useDetachSource(documentId);
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
                          void detach(source.id);
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
                <SidebarMenuAction aria-label={`Remove ${source.title}`} showOnHover onClick={() => {
                  if (count > 0) setConfirmId(source.id);
                  else {
                    remove(source.id);
                    void detach(source.id);
                  }
                }}>
                  <XIcon />
                </SidebarMenuAction>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      ) : (
        <p className="m-0 px-2 text-sm text-muted-foreground">No sources yet. Add one, then cite it from selected text.</p>
      )}
      <AddSource documentId={documentId} />
    </>
  );
}

function AddSource({ documentId }: { documentId: string }) {
  const { sources, attach } = useSources();
  const { sourceForm: open, setSourceForm: setOpen } = usePanel();
  return (
    <>
      <div className="px-2 pt-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <PlusIcon />
          Add a source
        </Button>
      </div>
      <AddSourceDialog open={open} onOpenChange={setOpen} documentId={documentId} attachedIds={sources.map((source) => source.id)} onAdded={(created) => attach({ id: created.id, title: created.title, url: created.url ?? undefined })} />
    </>
  );
}

export type { Source };
