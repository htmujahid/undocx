"use client";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { $createParagraphNode, $getRoot } from "lexical";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "~@/lib/utils";
import { createDocumentExtension } from "./extensions/document";
import { DraggableBlock } from "./plugins/draggable-block";
import { FloatingToolbar } from "./plugins/floating-toolbar";
import { PAGE_GAP_PX, pageDimensions, resolveMargins, usePageCount, usePageSettings, usePagination } from "./extensions/page";
import type { Note } from "./extensions/notes";
import type { Source } from "./extensions/sources";

function $createEmptyDocument() {
  $getRoot().append($createParagraphNode());
}

export function Editor({ documentId, initialState, notes = [], sources = [], children }: { documentId: string; initialState: string | null; notes?: Note[]; sources?: Source[]; children: ReactNode }) {
  const extension = useMemo(() => createDocumentExtension(documentId, initialState ?? $createEmptyDocument, { notes, sources }), [documentId, initialState, notes, sources]);
  return (
    <LexicalExtensionComposer key={documentId} extension={extension} contentEditable={null}>
      {children}
    </LexicalExtensionComposer>
  );
}

const card = "rounded-sm border border-border bg-card shadow-sm";

export function EditorContent() {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const page = usePageSettings();
  const pages = usePageCount();
  usePagination();
  const isPageless = page.layout === "pageless";
  const { width, height } = pageDimensions(page);
  const { top, right, bottom, left } = resolveMargins(page);
  const stride = `${height}mm + ${PAGE_GAP_PX}px`;
  const sheetHeight = isPageless ? undefined : `calc(${pages} * (${stride}) - ${PAGE_GAP_PX}px)`;
  return (
    <div className="flex w-max min-w-full px-4 py-8 lg:px-10">
      <div
        ref={setAnchor}
        className={cn("relative mx-auto shrink-0", isPageless && card)}
        style={isPageless ? { width: "52rem" } : { width: `${width}mm`, minHeight: sheetHeight }}
      >
        {isPageless
          ? null
          : Array.from({ length: pages }, (_, index) => (
              <div key={index} aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0", card)} style={{ top: `calc(${index} * (${stride}))`, height: `${height}mm` }} />
            ))}
        <ContentEditable aria-label="Document" spellCheck className="relative space-y-4 outline-none" style={{ padding: `${top}mm ${right}mm ${bottom}mm ${left}mm`, minHeight: sheetHeight }} />
        {anchor && <DraggableBlock anchorElem={anchor} />}
        {anchor && <FloatingToolbar anchorElem={anchor} />}
      </div>
    </div>
  );
}
