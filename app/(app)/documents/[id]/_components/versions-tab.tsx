"use client";

import { useState } from "react";
import { DotsThreeIcon, PencilSimpleIcon, RefreshCwIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { SidebarContent } from "~@/components/ui/sidebar";
import { useVersions, type VersionSummary } from "../versions/query";
import { VersionNameDialog } from "./version-name-dialog";
import { VersionRestoreDialog } from "./version-restore-dialog";
import { VersionDeleteDialog } from "./version-delete-dialog";
import { VersionSaveForm } from "./version-save-form";

function when(date: Date) {
  const value = new Date(date);
  const isToday = new Date().toDateString() === value.toDateString();
  const time = value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return isToday ? `Today, ${time}` : `${value.toLocaleDateString([], { day: "numeric", month: "short" })}, ${time}`;
}

function origin(version: VersionSummary) {
  if (version.kind === "manual") return "Saved by you";
  if (version.kind === "restore") return version.label ?? "Safety copy";
  return version.label ? `AI change: ${version.label}` : "AI change";
}

export function VersionsTab({ documentId }: { documentId: string }) {
  const { data: versions = [], isLoading } = useVersions(documentId);
  const [dialog, setDialog] = useState<{ kind: "restore" | "name" | "delete"; version: VersionSummary } | null>(null);
  const close = () => setDialog(null);

  return (
    <SidebarContent className="gap-4 px-4 py-4">
      <VersionSaveForm documentId={documentId} nextNumber={(versions[0]?.number ?? 0) + 1} />
      {isLoading ? (
        <p className="m-0 text-sm text-muted-foreground">Loading versions…</p>
      ) : versions.length === 0 ? (
        <p className="m-0 text-sm leading-normal text-muted-foreground">No versions yet. Save one when the document is in a state worth coming back to. Changes you keep from the assistant are saved here automatically.</p>
      ) : (
        <ol aria-label="Versions" className="m-0 grid list-none gap-1 p-0">
          {versions.map((version) => (
            <li key={version.id} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
              <span className="mt-0.5 w-8 shrink-0 font-mono text-xs text-primary">v{version.number}</span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm text-foreground">{version.name ?? origin(version)}</p>
                <p className="m-0 text-xs text-muted-foreground">
                  {version.name ? `${origin(version)} · ` : ""}
                  {when(version.createdAt)} · {version.wordCount.toLocaleString()} words
                </p>
              </div>
              <Menu onAction={(action) => setDialog({ kind: action as "restore" | "name" | "delete", version })}>
                <MenuTrigger aria-label={`Actions for version ${version.number}`} className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
                  <DotsThreeIcon className="size-4" />
                </MenuTrigger>
                <MenuContent align="end" className="min-w-44">
                  <MenuItem value="restore" icon={<RefreshCwIcon />}>
                    Restore
                  </MenuItem>
                  <MenuItem value="name" icon={<PencilSimpleIcon />}>
                    {version.name ? "Rename" : "Add a name"}
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="delete" icon={<TrashIcon />} destructive>
                    Delete
                  </MenuItem>
                </MenuContent>
              </Menu>
            </li>
          ))}
        </ol>
      )}
      {dialog?.kind === "restore" ? <VersionRestoreDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
      {dialog?.kind === "name" ? <VersionNameDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
      {dialog?.kind === "delete" ? <VersionDeleteDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
    </SidebarContent>
  );
}
