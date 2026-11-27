import { ClipboardDOMImportExtension } from "@lexical/clipboard";
import { EditorStateExtension, HorizontalRuleExtension, NodeSelectionDataSelectedExtension } from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { AutoLinkExtension, autoLinkEmailMatcher, autoLinkUrlMatcher, LinkExtension } from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import { configExtension, defineExtension, type InitialEditorStateType } from "lexical";
import { CitationNode } from "../nodes/citation-node";
import { PageBreakNode } from "../nodes/page-break-node";
import { LayoutExtension } from "./layout";
import { isValidUrl } from "../plugins/link";
import { MarkdownExtension } from "./markdown";
import { type Note, NotesExtension } from "./notes";
import { PageExtension } from "./page";
import { PanelExtension } from "./panel";
import { type Source, SourcesExtension } from "./sources";
import { editorTheme } from "../theme";

export function createDocumentExtension(documentId: string, $initialEditorState: InitialEditorStateType, { notes, sources }: { notes: Note[]; sources: Source[] }) {
  return defineExtension({
    name: `undocx/document/${documentId}`,
    namespace: "undocx",
    theme: editorTheme,
    $initialEditorState,
    dependencies: [
      RichTextExtension,
      ListExtension,
      CheckListExtension,
      configExtension(LinkExtension, { validateUrl: isValidUrl }),
      configExtension(AutoLinkExtension, { matchers: [autoLinkUrlMatcher, autoLinkEmailMatcher] }),
      HorizontalRuleExtension,
      TableExtension,
      LayoutExtension,
      ClipboardDOMImportExtension,
      EditorStateExtension,
      MarkdownExtension,
      configExtension(NotesExtension, { notes }),
      configExtension(SourcesExtension, { sources }),
      PageExtension,
      PanelExtension,
      configExtension(NodeSelectionDataSelectedExtension, { nodes: [CitationNode, PageBreakNode] }),
      configExtension(HistoryExtension, { delay: 500, maxDepth: 100 }),
    ],
  });
}
