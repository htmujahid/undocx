import "server-only";

import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { extensionOf, sourceLimits } from "./limits";

function tidy(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, sourceLimits.content);
}

export async function extractFileText(filename: string, bytes: Uint8Array) {
  const extension = extensionOf(filename);
  if (extension === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: true });
    return tidy(text);
  }
  if (extension === "docx") {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return tidy(value);
  }
  return tidy(new TextDecoder("utf-8").decode(bytes));
}
