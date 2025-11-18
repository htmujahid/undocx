import { notFound, redirect } from "next/navigation";

import { SerializedEditorState } from "lexical";
import { v4 as uuidv4 } from "uuid";

import { Editor } from "@/components/blocks/editor-x/editor";
import { EditorProvider } from "@/components/editor/context/editor-context";
import { createClient } from "@/lib/supabase/server";

const initialValue = {
  root: {
    children: [
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

export default async function Page({
  params,
}: {
  params: Promise<{ editor: string }>;
}) {
  const { editor } = await params;
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();

  if (editor === "new") {
    const newId = uuidv4();
    const userId = userData?.user?.id;
    if (!userId) {
      return redirect(`/auth/login?redirect=/editor/new`);
    }
    await client
      .from("documents")
      .insert({
        id: newId,
        user_id: userId,
      })
      .select();

    return redirect(`/editor/${newId}`);
  }

  // Fetch the document
  const { data, error } = await client
    .from("documents")
    .select("*, starred_documents(*)")
    .eq("id", editor)
    .single();

  if (error || !data) {
    // If user is not logged in and document is not found, redirect to login
    if (!userData?.user) {
      return redirect(`/auth/login?redirect=/editor/${editor}`);
    }
    notFound();
  }

  const { data: comments } = await client.rpc("get_comments_with_users", {
    p_document_id: editor,
  });

  const { data: collaborators } = await client
    .from("shared_documents")
    .select("*")
    .eq("document_id", editor);

  return (
    <EditorProvider
      document={data}
      user={userData?.user ?? undefined}
      comments={comments ?? []}
      collaborators={collaborators ?? []}
    >
      <Editor
        documentId={editor}
        editorSerializedState={
          (data.content ?? initialValue) as unknown as SerializedEditorState
        }
      />
    </EditorProvider>
  );
}
