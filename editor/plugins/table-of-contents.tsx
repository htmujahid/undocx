"use client";

import { TableOfContentsPlugin, type TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getNodeByKey, $getRoot, $isRootNode, type LexicalEditor, type LexicalNode, type NodeKey } from "lexical";
import { useEffect, useState, type JSX } from "react";

export type { TableOfContentsEntry };

export function TableOfContents({ children }: { children: (entries: TableOfContentsEntry[], editor: LexicalEditor) => JSX.Element }) {
  return <TableOfContentsPlugin>{children}</TableOfContentsPlugin>;
}

export function scrollToHeading(editor: LexicalEditor, key: NodeKey) {
  const element = editor.getElementByKey(key);
  element?.scrollIntoView({ block: "start", behavior: "smooth" });
}

export function useActiveHeading(editor: LexicalEditor, entries: TableOfContentsEntry[]) {
  const [active, setActive] = useState<NodeKey | null>(null);
  useEffect(() => {
    const scroller = editor.getRootElement()?.closest<HTMLElement>("[data-scroller]");
    if (!scroller || entries.length === 0) return;
    const update = () => {
      const top = scroller.getBoundingClientRect().top + 96;
      const isAtBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      let best = entries[0][0];
      for (const [key] of entries) {
        const element = editor.getElementByKey(key);
        if (element && element.getBoundingClientRect().top <= top) best = key;
      }
      if (isAtBottom) best = entries[entries.length - 1][0];
      setActive(best);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [editor, entries]);
  return active;
}

export function isTopLevelSection(editor: LexicalEditor, key: NodeKey) {
  return editor.getEditorState().read(() => $isRootNode($getNodeByKey(key)?.getParent() ?? null));
}

export function moveSections(editor: LexicalEditor, order: NodeKey[]) {
  editor.update(() => {
    const root = $getRoot();
    const preface: LexicalNode[] = [];
    const sections = new Map<NodeKey, LexicalNode[]>();
    let current = preface;
    for (const child of root.getChildren()) {
      if ($isHeadingNode(child) && child.getTag() === "h2") {
        current = [];
        sections.set(child.getKey(), current);
      }
      current.push(child);
    }
    const ordered = order.filter((key) => sections.has(key));
    if (ordered.length !== sections.size) return;
    root.splice(0, root.getChildrenSize(), [...preface, ...ordered.flatMap((key) => sections.get(key) ?? [])]);
  });
}
