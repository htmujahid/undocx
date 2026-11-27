"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { DotsThreeIcon, LoaderCircleIcon, PencilSimpleIcon, RefreshCwIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { SidebarContent } from "~@/components/ui/sidebar";
import { DOCUMENT_RESTORED_COMMAND } from "~@/editor/extensions/versions";
import { versionLimits } from "~@/lib/documents/limits";
import { versionNameSchema, type VersionNameValues } from "~@/lib/documents/schemas";
import { useDeleteVersion, useRenameVersion, useRestoreVersion, useSaveVersion, useVersions, type VersionSummary } from "../versions/query";

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

function NameDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const { trigger } = useRenameVersion(documentId);
  const form = useForm<VersionNameValues>({ resolver: zodResolver(versionNameSchema), defaultValues: { name: version.name ?? "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger({ id: version.id, values });
    if (result?.error) return form.setError("root.server", { message: result.error });
    onClose();
  });
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <DialogTitle>Name version {version.number}</DialogTitle>
              <DialogDescription>Leave it empty to show just the number.</DialogDescription>
            </div>
            <InputField control={form.control} name="name" label="Name" isLabelHidden max={versionLimits.name} autoFocus onFocus={(event) => event.currentTarget.select()} placeholder="Sent to Ruth" />
            {errors.root?.server ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errors.root.server.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Save name
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RestoreDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const [editor] = useLexicalComposerContext();
  const { trigger } = useRestoreVersion(documentId);
  const [isRestoring, setIsRestoring] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function restore() {
    setIsRestoring(true);
    setProblem(null);
    try {
      const result = await trigger({ id: version.id, current: JSON.stringify(editor.getEditorState().toJSON()) });
      if (!result || "error" in result) {
        setProblem(result?.error ?? "The version could not be restored.");
        return;
      }
      editor.setEditorState(editor.parseEditorState(result.content));
      editor.dispatchCommand(DOCUMENT_RESTORED_COMMAND, { version: result.version });
      onClose();
    } catch {
      setProblem("The version could not be restored. Try again.");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Restore version {version.number}?</DialogTitle>
          <DialogDescription>The document goes back to how it was then. Your current text is saved as a new version first, so nothing is lost.</DialogDescription>
          {problem ? (
            <p className="m-0 text-sm text-destructive" role="alert">
              {problem}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
          <Button variant="primary" disabled={isRestoring} onClick={() => void restore()}>
            {isRestoring ? <LoaderCircleIcon className="animate-spin" /> : null}
            Restore
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const { trigger, isMutating } = useDeleteVersion(documentId);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Delete version {version.number}?</DialogTitle>
          <DialogDescription>Only this saved copy is deleted. Your document is not changed.</DialogDescription>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep it</DialogClose>
          <Button
            variant="secondary"
            disabled={isMutating}
            className="text-destructive"
            onClick={async () => {
              await trigger(version.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SaveForm({ documentId, nextNumber }: { documentId: string; nextNumber: number }) {
  const [editor] = useLexicalComposerContext();
  const { trigger } = useSaveVersion(documentId);
  const form = useForm<VersionNameValues>({ resolver: zodResolver(versionNameSchema), defaultValues: { name: "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger({ kind: "manual", name: values.name, content: JSON.stringify(editor.getEditorState().toJSON()) });
    if ("error" in result) return form.setError("root.server", { message: result.error });
    form.reset();
  });
  return (
    <form onSubmit={submit} noValidate className="grid gap-2 rounded-md border border-border bg-card p-3">
      <InputField control={form.control} name="name" label="Name this version (optional)" max={versionLimits.name} placeholder="Sent to Ruth" description={`Saved as version ${nextNumber}. Without a name it is just the number.`} />
      {errors.root?.server ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
        Save version
      </Button>
    </form>
  );
}

export function VersionsTab({ documentId }: { documentId: string }) {
  const { data: versions = [], isLoading } = useVersions(documentId);
  const [dialog, setDialog] = useState<{ kind: "restore" | "name" | "delete"; version: VersionSummary } | null>(null);
  const close = () => setDialog(null);

  return (
    <SidebarContent className="gap-4 px-4 py-4">
      <SaveForm documentId={documentId} nextNumber={(versions[0]?.number ?? 0) + 1} />
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
      {dialog?.kind === "restore" ? <RestoreDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
      {dialog?.kind === "name" ? <NameDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
      {dialog?.kind === "delete" ? <DeleteDialog documentId={documentId} version={dialog.version} onClose={close} /> : null}
    </SidebarContent>
  );
}
