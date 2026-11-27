import { revalidatePath } from "next/cache";
import { newId } from "~@/lib/id";
import { getUserId } from "~@/lib/auth/session";
import { countWords } from "~@/lib/context/limits";
import { findDocument } from "~@/lib/db/repository/document";
import { attachSources, countDocumentSources, countSources, insertSource } from "~@/lib/db/repository/source";
import { extractFileText } from "~@/lib/sources/extract";
import { extensionOf, sourceLimits } from "~@/lib/sources/limits";
import { deleteObject, putObject } from "~@/lib/storage/s3";

function problem(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return problem(401, "Sign in to add sources.");

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return problem(400, "Choose a file to upload.");
  if (file.size === 0) return problem(400, "That file is empty.");
  if (file.size > sourceLimits.bytes) return problem(413, `Files can be up to ${sourceLimits.bytes / 1024 / 1024} MB.`);
  const extension = extensionOf(file.name);
  if (!(sourceLimits.extensions as readonly string[]).includes(extension)) return problem(415, `Upload one of: ${sourceLimits.extensions.join(", ")}.`);

  const documentIdValue = form.get("documentId");
  const documentId = typeof documentIdValue === "string" && documentIdValue ? documentIdValue : undefined;
  if ((await countSources(userId)) >= sourceLimits.perUser) return problem(409, `You can keep up to ${sourceLimits.perUser} sources.`);
  if (documentId) {
    if (!(await findDocument(userId, documentId))) return problem(404, "This document no longer exists.");
    if ((await countDocumentSources(documentId)) >= sourceLimits.perDocument) return problem(409, `A document can use up to ${sourceLimits.perDocument} sources.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let content: string;
  try {
    content = await extractFileText(file.name, bytes);
  } catch {
    return problem(422, "That file could not be read. Check that it is not damaged or password protected.");
  }
  if (!content) return problem(422, "No text could be found in that file.");

  const titleValue = form.get("title");
  const title = (typeof titleValue === "string" && titleValue.trim() ? titleValue.trim() : file.name.replace(/\.[^.]+$/, "")).slice(0, sourceLimits.title);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || `file.${extension}`;
  const key = `users/${userId}/sources/${newId()}/${safeName}`;
  await putObject(key, bytes, file.type || "application/octet-stream");

  try {
    const created = await insertSource(userId, { kind: "file", title, content, wordCount: countWords(content) }, { key, filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size });
    if (documentId) await attachSources(userId, documentId, [created.id]);
    revalidatePath("/library", "layout");
    revalidatePath("/documents", "layout");
    return Response.json({ source: created });
  } catch {
    await deleteObject(key).catch(() => undefined);
    return problem(500, "The file could not be saved. Try again.");
  }
}
