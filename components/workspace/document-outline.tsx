"use client"

import { useEffect, useState } from "react"

import { $getRoot } from "lexical"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isHeadingNode } from "@lexical/rich-text"

import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarContent } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface OutlineItem {
  key: string
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  text: string
}

const LEVEL_INDENT: Record<OutlineItem["tag"], number> = {
  h1: 0,
  h2: 12,
  h3: 22,
  h4: 30,
  h5: 36,
  h6: 40,
}

const LEVEL_TEXT: Record<OutlineItem["tag"], string> = {
  h1: "text-[11px] font-medium text-foreground",
  h2: "text-[11px] text-foreground/80",
  h3: "text-[11px] text-muted-foreground",
  h4: "text-[10px] text-muted-foreground/80",
  h5: "text-[10px] text-muted-foreground/70",
  h6: "text-[10px] text-muted-foreground/60",
}

export function DocumentOutline() {
  const [editor] = useLexicalComposerContext()
  const [outline, setOutline] = useState<OutlineItem[]>([])

  useEffect(() => {
    const buildOutline = () => {
      editor.getEditorState().read(() => {
        setOutline(
          $getRoot()
            .getChildren()
            .filter($isHeadingNode)
            .map((node) => ({
              key: node.getKey(),
              tag: node.getTag() as OutlineItem["tag"],
              text: node.getTextContent().trim() || node.getTag().toUpperCase(),
            }))
        )
      })
    }
    buildOutline()
    return editor.registerUpdateListener(() => buildOutline())
  }, [editor])

  const scrollToHeading = (key: string) => {
    editor
      .getElementByKey(key)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <SidebarContent className="p-0">
      <div className="px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Outline
        </span>
      </div>
      <ScrollArea className="h-full border-t">
        {outline.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-xs text-muted-foreground">No headings yet.</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Add headings to see the document outline.
            </p>
          </div>
        ) : (
          <div className="py-1.5">
            {outline.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToHeading(item.key)}
                style={{ paddingLeft: `${LEVEL_INDENT[item.tag] + 12}px` }}
                className="group relative flex w-full items-center rounded-sm py-1 pr-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="absolute inset-y-1 left-0 w-0.5 scale-y-0 rounded-full bg-primary/60 transition-transform group-hover:scale-y-100" />
                <span
                  className={cn("truncate leading-snug", LEVEL_TEXT[item.tag])}
                >
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </SidebarContent>
  )
}
