"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { exportFile, importFile } from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Clock,
  Copy,
  Download,
  FilePlus,
  Files,
  FolderOpen,
  MenuIcon,
  Share2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { useEditorContext } from "@/components/editor/context/editor-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  copyDocumentAction,
  moveToTrashAction,
  starDocumentAction,
  unstarDocumentAction,
} from "./actions";

export function AppMenuPlugin() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { document, user } = useEditorContext();
  const [editor] = useLexicalComposerContext();

  if (!document || !user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <MenuIcon className="size-4 stroke-3" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex h-full flex-col">
          <div className="border-b">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Document management and application settings
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="lg:border-r">
            <ScrollArea className="h-[calc(100svh-88px)]">
              <div className="space-y-6 p-4">
                {/* Document Actions */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Document</h3>
                  <div className="space-y-1">
                    <MenuButton
                      icon={<FilePlus className="size-5" />}
                      label="New Document"
                      onClick={() => router.push("/editor/new")}
                    />
                    <MenuButton
                      icon={<FolderOpen className="size-5" />}
                      label="Open Document"
                      onClick={() => router.push("/editor")}
                    />
                    <MenuButton
                      icon={<Copy className="size-5" />}
                      label="Make a Copy"
                      onClick={async () => {
                        try {
                          const result = await copyDocumentAction(
                            document.id,
                            user.id,
                          );
                          toast.success("Document copied");
                          router.push(`/editor/${result.id}`);
                        } catch {
                          toast.error("Failed to copy document");
                        }
                      }}
                    />
                    <MenuButton
                      icon={<Star className="size-5" />}
                      label={
                        document?.starred_documents?.length
                          ? "Unstar Document"
                          : "Star Document"
                      }
                      onClick={async () => {
                        if (document?.starred_documents?.length) {
                          toast.promise(
                            unstarDocumentAction(document.id, user.id),
                            {
                              loading: "Unstarring document...",
                              success: "Document unstarred",
                              error: "Failed to unstar document",
                            },
                          );
                        } else {
                          toast.promise(
                            starDocumentAction(document.id, user.id),
                            {
                              loading: "Starring document...",
                              success: "Document starred",
                              error: "Failed to star document",
                            },
                          );
                        }
                      }}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="hover:bg-accent group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors">
                          <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                            <Trash2 className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium">
                              Move to Trash
                            </span>
                          </div>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move &quot;{document.title}&quot; to
                            trash. You can restore it later from the trash
                            section.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              toast.promise(moveToTrashAction(document.id), {
                                loading: "Moving document to trash...",
                                success: () => {
                                  router.push("/editor");
                                  return "Document moved to trash";
                                },
                                error: "Failed to move document to trash",
                              });
                            }}
                          >
                            Move to Trash
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </section>

                {/* Import/Export */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Import & Export</h3>
                  <div className="space-y-1">
                    <MenuButton
                      icon={<Upload className="size-5" />}
                      label="Import Document"
                      // description="Word, PDF, Markdown"
                      onClick={() => importFile(editor)}
                    />
                    <MenuButton
                      icon={<Download className="size-5" />}
                      label="Export Document"
                      // description="PDF, DOCX, HTML, Markdown"
                      onClick={() => {
                        exportFile(editor, {
                          fileName: `${document.title.replace(/\s+/g, "_")}_${new Date().toISOString()}`,
                          source: "document",
                        });
                      }}
                    />
                  </div>
                </section>

                {/* Browse Documents */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Browse</h3>
                  <div className="space-y-1">
                    <MenuButton
                      icon={<Clock className="size-5" />}
                      label="Recent Documents"
                      onClick={() => router.push("/editor?section=recent")}
                    />
                    <MenuButton
                      icon={<Star className="size-5" />}
                      label="Starred"
                      onClick={() => router.push("/editor?section=starred")}
                    />
                    <MenuButton
                      icon={<Files className="size-5" />}
                      label="All Documents"
                      onClick={() =>
                        router.push("/editor?section=all-documents")
                      }
                    />
                    <MenuButton
                      icon={<Share2 className="size-5" />}
                      label="Shared with Me"
                      onClick={() => router.push("/editor?section=shared")}
                    />
                    <MenuButton
                      icon={<Trash2 className="size-5" />}
                      label="Trash"
                      onClick={() => router.push("/editor?section=trash")}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  shortcut?: string;
  badge?: string;
  onClick: () => Promise<void> | void;
  hidden?: boolean;
}

function MenuButton({
  icon,
  label,
  description,
  shortcut,
  badge,
  onClick,
  hidden,
}: MenuButtonProps) {
  const [pending, startTransition] = useTransition();
  if (hidden) return null;
  return (
    <button
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
      disabled={pending}
      className="hover:bg-accent group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors"
    >
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {badge && (
            <span className="bg-muted rounded px-1.5 py-0.5 text-xs">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        )}
      </div>
      {shortcut && (
        <span className="text-muted-foreground font-mono text-xs">
          {shortcut}
        </span>
      )}
    </button>
  );
}
