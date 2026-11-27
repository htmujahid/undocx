"use client";

import type { LexicalEditor } from "lexical";
import {
  isTopLevelSection,
  moveSections,
  scrollToHeading,
  TableOfContents,
  useActiveHeading,
  type TableOfContentsEntry,
} from "~@/editor/plugins/table-of-contents";
import { WordCount } from "~@/editor/plugins/word-count";
import { GripIcon } from "~@/components/ui/icons";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "~@/components/ui/sortable-list";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "~@/components/ui/sidebar";
import { SourcesSection } from "./sources-section";

function OutlineMenu({
  entries,
  editor,
}: {
  entries: TableOfContentsEntry[];
  editor: LexicalEditor;
}) {
  const sections = entries.filter(
    ([key, , tag]) => tag === "h2" && isTopLevelSection(editor, key),
  );
  const active = useActiveHeading(editor, sections);
  const titles = new Map(
    sections.map(([key, text]) => [key, text || "Untitled section"]),
  );
  return (
    <>
      <p id="outline-reorder-help" className="sr-only">
        Press Space or Enter on a handle to pick up a section. Use the arrow
        keys to move it, Space or Enter to drop it, and Escape to cancel.
      </p>
      <SortableList
        aria-label="Outline"
        value={sections.map(([key]) => key)}
        onValueChange={(order) => moveSections(editor, order)}
        label={(key) => titles.get(key)}
        className="m-0 flex w-full min-w-0 list-none flex-col gap-1 p-0"
      >
        {({ order }) =>
          order.map((key, index) => {
            const title = titles.get(key);
            if (title === undefined) return null;
            return (
              <SortableListItem key={key} value={key}>
                <SidebarMenuButton
                  onClick={() => scrollToHeading(editor, key)}
                  isActive={active === key}
                  tooltip={title}
                >
                  <span className="w-4 shrink-0 text-center font-serif tabular-nums text-primary">
                    {index + 1}
                  </span>
                  <span className="truncate">{title}</span>
                </SidebarMenuButton>
                <SortableListHandle
                  value={key}
                  data-sidebar="menu-action"
                  aria-label={`Move ${title}`}
                  aria-describedby="outline-reorder-help"
                >
                  <GripIcon />
                </SortableListHandle>
              </SortableListItem>
            );
          })
        }
      </SortableList>
    </>
  );
}

export function OutlineTab({ documentId }: { documentId: string }) {
  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Outline</SidebarGroupLabel>
          <SidebarGroupContent>
            <TableOfContents>
              {(entries, editor) => (
                <OutlineMenu entries={entries} editor={editor} />
              )}
            </TableOfContents>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-t border-sidebar-border">
          <SidebarGroupLabel>Sources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SourcesSection documentId={documentId} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-2.5 text-xs text-muted-foreground">
        <WordCount />
      </SidebarFooter>
    </>
  );
}
