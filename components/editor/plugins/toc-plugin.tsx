"use client";

import * as React from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import { TableOfContentsPlugin as LexicalTableOfContentsPlugin } from "@lexical/react/LexicalTableOfContentsPlugin";
import type { HeadingTagType } from "@lexical/rich-text";
import type { NodeKey } from "lexical";
import { List, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface TocHeading {
  key: NodeKey;
  text: string;
  tag: HeadingTagType;
}

interface TocSection {
  key: NodeKey;
  title: string;
  tag: HeadingTagType;
  items: TocHeading[];
}

// Helper to get heading level from tag
function getHeadingLevel(tag: HeadingTagType): number {
  return parseInt(tag.substring(1), 10);
}

// Transform flat TOC entries into grouped sections
function groupTableOfContents(
  tableOfContents: Array<TableOfContentsEntry>,
): TocSection[] {
  const sections: TocSection[] = [];
  let currentSection: TocSection | null = null;

  for (const [key, text, tag] of tableOfContents) {
    const level = getHeadingLevel(tag);

    if (level === 1) {
      // H1 starts a new section
      currentSection = {
        key,
        title: text,
        tag,
        items: [],
      };
      sections.push(currentSection);
    } else if (currentSection) {
      // H2-H6 are items under the current section
      currentSection.items.push({ key, text, tag });
    } else {
      // No H1 yet, create a standalone section for this heading
      currentSection = {
        key,
        title: text,
        tag,
        items: [],
      };
      sections.push(currentSection);
    }
  }

  return sections;
}

function TocContent({
  tableOfContents,
}: {
  tableOfContents: Array<TableOfContentsEntry>;
}) {
  const [selectedKey, setSelectedKey] = React.useState<NodeKey>("");
  const { toggleSidebar } = useSidebar();
  const [editor] = useLexicalComposerContext();

  // Scroll to node when clicked
  const scrollToNode = React.useCallback(
    (key: NodeKey) => {
      editor.getEditorState().read(() => {
        const domElement = editor.getElementByKey(key);
        if (domElement !== null) {
          domElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setSelectedKey(key);
        }
      });
    },
    [editor],
  );

  // Transform flat TOC into grouped sections
  const tocSections = React.useMemo(
    () => groupTableOfContents(tableOfContents),
    [tableOfContents],
  );

  const handleHeadingClick = (key: NodeKey) => {
    scrollToNode(key);
  };

  return (
    <>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <h2 className="text-foreground text-base font-medium">
              Table of Contents
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleSidebar()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {tocSections.map((section) => (
                <SidebarMenuItem key={section.key}>
                  <SidebarMenuButton
                    isActive={selectedKey === section.key}
                    onClick={() => handleHeadingClick(section.key)}
                    className="font-medium"
                  >
                    {section.title}
                  </SidebarMenuButton>
                  {section.items && section.items.length > 0 ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {section.items.map((item) => (
                        <SidebarMenuSubItem key={item.key}>
                          <SidebarMenuSubButton
                            isActive={selectedKey === item.key}
                            onClick={() => handleHeadingClick(item.key)}
                          >
                            {item.text}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </>
  );
}

export function TocPlugin({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="floating"
      side="left"
      className="top-(--header-height) bottom-(--footer-height) h-[calc(100svh-var(--header-height)-var(--footer-height))]!"
      {...props}
    >
      <LexicalTableOfContentsPlugin>
        {(tableOfContents) => <TocContent tableOfContents={tableOfContents} />}
      </LexicalTableOfContentsPlugin>
    </Sidebar>
  );
}
