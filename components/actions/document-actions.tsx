"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { MoreVertical, Star, StarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

type DocumentActionsProps = {
  documentId: string;
  isStarred?: boolean;
};

export function DocumentActions({
  documentId,
  isStarred = false,
}: DocumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleStar() {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    if (isStarred) {
      // Unstar
      const { error } = await supabase
        .from("starred_documents")
        .delete()
        .eq("document_id", documentId);

      if (error) {
        console.error("Failed to unstar document:", error);
        toast.error("Failed to unstar document");
        setLoading(false);
        return;
      }

      toast.success("Removed from starred");
    } else {
      // Star
      const { error } = await supabase.from("starred_documents").insert({
        document_id: documentId,
        user_id: user.id,
      });

      if (error) {
        console.error("Failed to star document:", error);
        toast.error("Failed to star document");
        setLoading(false);
        return;
      }

      toast.success("Added to starred");
    }

    setLoading(false);
    router.refresh();
  }

  async function trashDocument() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.rpc("trash_document", {
      p_document_id: documentId,
    });

    if (error) {
      console.error("Failed to trash document:", error);
      toast.error("Failed to trash document");
      setLoading(false);
      return;
    }

    toast.success("Document moved to trash");
    setLoading(false);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleStar}>
          {isStarred ? (
            <>
              <StarOff className="h-4 w-4" />
              Remove Star
            </>
          ) : (
            <>
              <Star className="h-4 w-4" />
              Add Star
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={trashDocument}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
