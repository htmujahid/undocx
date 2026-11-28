import { getExtensionDependencyFromEditor } from "@lexical/extension";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { LexicalEditor } from "lexical";
import { compileDocx } from "./export/docx";
import { $buildExportDoc } from "./export/model";
import { compileOdt } from "./export/odt";
import { compilePdf } from "./export/pdf";
import { $citationOrder } from "./nodes/citation-node";
import { $exportMarkdown } from "./extensions/markdown";
import { SourcesExtension, type Source } from "./extensions/sources";

export type ExportFormat = {
  id: string;
  label: string;
  description: string;
  extension: string;
  mime: string;
  $export: (editor: LexicalEditor) => string | Uint8Array<ArrayBuffer>;
};

export const exportFormats: ExportFormat[] = [
  {
    id: "md",
    label: "Markdown",
    description: "Headings, lists, quotes, links, tables, rules and citations as Markdown. Columns become a one-row table. Alignment is dropped.",
    extension: "md",
    mime: "text/markdown;charset=utf-8",
    $export: (editor) => $exportMarkdown() + markdownReferences($references(editor)),
  },
  {
    id: "html",
    label: "HTML",
    description: "A fragment of semantic HTML with the document's structure. Styling is left to the page that embeds it.",
    extension: "html",
    mime: "text/html;charset=utf-8",
    $export: (editor) => stripClasses($generateHtmlFromNodes(editor) + htmlReferences($references(editor))),
  },
  {
    id: "lexical",
    label: "Lexical JSON",
    description: "The editor state exactly as Undocx stores it, to re-import later without losing anything.",
    extension: "json",
    mime: "application/json;charset=utf-8",
    $export: (editor) => JSON.stringify(editor.getEditorState().toJSON(), null, 2),
  },
  {
    id: "docx",
    label: "Word",
    description: "A .docx file with headings, lists, tables, links and page setup. Citations are superscript numbers with a References list at the end.",
    extension: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    $export: (editor) => compileDocx($buildExportDoc($references(editor))),
  },
  {
    id: "odt",
    label: "OpenDocument",
    description: "An .odt file for LibreOffice and other open office suites, with the same structure as the Word export.",
    extension: "odt",
    mime: "application/vnd.oasis.opendocument.text",
    $export: (editor) => compileOdt($buildExportDoc($references(editor))),
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Page numbers and a References list at the end, using your page setup. Standard fonts, so Latin letters only. Nothing in the file depends on Undocx.",
    extension: "pdf",
    mime: "application/pdf",
    $export: (editor) => compilePdf($buildExportDoc($references(editor))),
  },
];

function $references(editor: LexicalEditor): Source[] {
  const { sources } = getExtensionDependencyFromEditor(editor, SourcesExtension).output;
  return $citationOrder().flatMap((id) => sources.peek().find((source) => source.id === id) ?? []);
}

function markdownReferences(references: Source[]) {
  if (references.length === 0) return "";
  const items = references.map((source, index) => `${index + 1}. ${source.url ? `[${source.title}](${source.url})` : source.title}`);
  return `\n\n## References\n\n${items.join("\n")}\n`;
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function htmlReferences(references: Source[]) {
  if (references.length === 0) return "";
  const items = references.map((source) => `<li>${source.url ? `<a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a>` : escapeHtml(source.title)}</li>`);
  return `<h2>References</h2><ol>${items.join("")}</ol>`;
}

function stripClasses(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const element of template.content.querySelectorAll("[class]")) element.removeAttribute("class");
  return template.innerHTML;
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
}

export function exportDocument(editor: LexicalEditor, format: ExportFormat) {
  return editor.read(() => format.$export(editor));
}

export function downloadFile(name: string, content: string | Uint8Array<ArrayBuffer>, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
