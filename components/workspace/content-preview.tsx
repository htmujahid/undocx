"use client"

import { useRef } from "react"

import { ContentEditable } from "@lexical/react/LexicalContentEditable"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  EditableTitle,
  FootnoteList,
  WordCount,
} from "@/components/workspace/content-preview-parts"
import { SelectionMarkerPlugin } from "@/components/workspace/editor/selection-marker-plugin"

export function ContentPreview({ title }: { title: string }) {
  const contentRef = useRef<HTMLDivElement>(null!)

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div
          ref={contentRef}
          className="mx-auto max-w-[720px] px-4 py-6 sm:px-8 sm:py-8"
        >
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Generated document
            </p>
            <EditableTitle title={title} />
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <WordCount />
              <span>·</span>
              <span>Just now</span>
            </div>
          </div>

          <Separator className="mb-6" />

          <ContentEditable className="space-y-3 outline-none" />

          <SelectionMarkerPlugin containerRef={contentRef} />

          <FootnoteList />
        </div>
      </ScrollArea>
    </div>
  )
}
