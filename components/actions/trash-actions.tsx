"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type TrashActionsProps = {
  documentId: string;
};

export function TrashActions({ documentId }: TrashActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function restoreDocument() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.rpc("restore_document", {
      p_document_id: documentId,
    });

    if (error) {
      console.error("Failed to restore document:", error);
      toast.error("Failed to restore document");
      setLoading(false);
      return;
    }

    toast.success("Document restored");
    setLoading(false);
    router.refresh();
  }

  async function permanentlyDelete() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.rpc("permanently_delete_document", {
      p_document_id: documentId,
    });

    if (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
      setLoading(false);
      return;
    }

    toast.success("Document permanently deleted");
    setLoading(false);
    setShowDeleteDialog(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={restoreDocument}
          disabled={loading}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restore
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Forever
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document and remove all of its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={permanentlyDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
