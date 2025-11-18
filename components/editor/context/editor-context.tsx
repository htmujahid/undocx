"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";

import { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

import { Comments } from "../types";

type SaveStatus = "idle" | "saving" | "saved";
type DocumentMode = "editing" | "viewing" | "commenting";

type EditorContextType = {
  document: Tables<"documents"> & {
    starred_documents: Tables<"starred_documents">[];
  };
  comments: Comments[];
  collaborators: Tables<"shared_documents">[];
  user?: User;
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
  documentMode: DocumentMode;
  setDocumentMode: (mode: DocumentMode) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  document,
  comments: initialComments,
  collaborators: initialCollaborators,
  user,
}: React.PropsWithChildren<{
  document: Tables<"documents"> & {
    starred_documents: Tables<"starred_documents">[];
  };
  comments: Comments[];
  collaborators: Tables<"shared_documents">[];
  user?: User;
}>) {
  const [comments, setComments] = useState<Comments[]>(initialComments);
  const [collaborators, setCollaborators] =
    useState<Tables<"shared_documents">[]>(initialCollaborators);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [documentMode, setDocumentMode] = useState<DocumentMode>("editing");

  useEffect(() => {
    const supabase = createClient();
    // Subscribe to comments for this document
    const commentsChannel = supabase
      .channel(`comments:${document.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `document_id=eq.${document.id}`,
        },
        (payload) => {
          const newComment = payload.new as Tables<"comments">;
          // setComments((current) => [...current, { ...newComment, user: user! }]);
          setComments((current) => [
            ...current,
            {
              ...newComment,
              user_email: user?.email,
              user_id: user?.id,
              user_name: user?.user_metadata.full_name,
              user_picture_url: user?.user_metadata.avatar_url,
            } as Comments,
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "comments",
          filter: `document_id=eq.${document.id}`,
        },
        (payload) => {
          const updatedComment = payload.new as Tables<"comments">;
          setComments((current) =>
            current.map((comment) =>
              comment.id === updatedComment.id
                ? ({
                    ...updatedComment,
                    user_email: comment.user_email,
                    user_id: comment.user_id,
                    user_name: comment.user_name,
                    user_picture_url: comment.user_picture_url,
                  } as Comments)
                : comment,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
        },
        (payload) => {
          const deletedComment = payload.old as Tables<"comments">;
          console.log("Deleted comment:", deletedComment);
          setComments((current) =>
            current.filter((comment) => comment.id !== deletedComment.id),
          );
        },
      )
      .subscribe();

    // Subscribe to collaborators for this document
    const collaboratorsChannel = supabase
      .channel(`collaborators:${document.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shared_documents",
          filter: `document_id=eq.${document.id}`,
        },
        (payload) => {
          const newCollaborator = payload.new as Tables<"shared_documents">;
          setCollaborators((current) => [...current, newCollaborator]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_documents",
          filter: `document_id=eq.${document.id}`,
        },
        (payload) => {
          const updatedCollaborator = payload.new as Tables<"shared_documents">;
          setCollaborators((current) =>
            current.map((collaborator) =>
              collaborator.id === updatedCollaborator.id
                ? updatedCollaborator
                : collaborator,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "shared_documents",
        },
        (payload) => {
          const deletedCollaborator = payload.old as Tables<"shared_documents">;
          setCollaborators((current) =>
            current.filter(
              (collaborator) => collaborator.id !== deletedCollaborator.id,
            ),
          );
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(collaboratorsChannel);
    };
  }, [document.id, user]);

  return (
    <EditorContext.Provider
      value={{
        document,
        comments,
        collaborators,
        user,
        saveStatus,
        setSaveStatus,
        documentMode,
        setDocumentMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);

  if (context === undefined) {
    throw new Error("useEditorContext must be used within EditorProvider");
  }

  return context;
}

// Export types for convenience
export type { SaveStatus, DocumentMode };
