"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function moveToTrashAction(documentId: string) {
  const client = await createClient();

  const { error } = await client.rpc("trash_document", {
    p_document_id: documentId,
  });

  if (error) {
    throw new Error("Failed to move document to trash.");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function starDocumentAction(documentId: string, userId: string) {
  const client = await createClient();

  const { error } = await client
    .from("starred_documents")
    .insert({ document_id: documentId, user_id: userId });
  if (error) {
    throw new Error("Failed to star document.");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function unstarDocumentAction(documentId: string, userId: string) {
  const client = await createClient();
  const { error } = await client
    .from("starred_documents")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Failed to unstar document.");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function copyDocumentAction(documentId: string, userId: string) {
  const client = await createClient();

  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !data) {
    throw new Error("Document not found.");
  }

  const newDocument = {
    user_id: userId,
    title: `${data.title} (Copy)`,
    content: data.content,
  };

  const { data: newData, error: insertError } = await client
    .from("documents")
    .insert(newDocument)
    .select()
    .single();

  if (insertError) {
    throw new Error("Failed to copy document.");
  }

  return newData;
}

export async function inviteCollaboratorAction(
  documentId: string,
  email: string,
  accessLevel: "edit" | "comment" | "view",
  sharedBy: string,
) {
  const client = await createClient();

  const { error } = await client.from("shared_documents").insert({
    document_id: documentId,
    email: email,
    access_level: accessLevel,
    shared_by: sharedBy,
  });

  if (error) {
    // Check for duplicate error
    if (error.code === "23505") {
      throw new Error("User already has access to this document");
    }
    throw new Error("Failed to invite user");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function removeCollaboratorAction(
  collaboratorId: string,
  documentId: string,
) {
  const client = await createClient();

  const { error } = await client
    .from("shared_documents")
    .delete()
    .eq("id", collaboratorId);

  if (error) {
    throw new Error("Failed to remove collaborator");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function updateCollaboratorPermissionAction(
  collaboratorId: string,
  documentId: string,
  accessLevel: "edit" | "comment" | "view",
) {
  const client = await createClient();

  const { error } = await client
    .from("shared_documents")
    .update({ access_level: accessLevel })
    .eq("id", collaboratorId);

  if (error) {
    throw new Error("Failed to update permission");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}

export async function toggleDocumentPublicAction(
  documentId: string,
  isPublic: boolean,
) {
  const client = await createClient();

  const { error } = await client
    .from("documents")
    .update({ is_public: isPublic })
    .eq("id", documentId);

  if (error) {
    throw new Error("Failed to update document visibility");
  }

  revalidatePath(`/editor/${documentId}`);
  return null;
}
