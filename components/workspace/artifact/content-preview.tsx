"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  EditableTitle,
  FootnoteList,
  WordCount,
} from "@/components/workspace/artifact/content-preview-parts"
import { SelectionMarkerPlugin } from "@/components/workspace/editor/selection-marker-plugin"

function EditorReadyPlugin({ onReady }: { onReady: () => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const unregister = editor.registerUpdateListener(() => {
      onReady()
      unregister()
    })
    // Fallback for empty editors where no update fires
    const t = setTimeout(onReady, 500)
    return () => {
      unregister()
      clearTimeout(t)
    }
  }, [editor, onReady])

  return null
}

export function ContentPreview({ title }: { title: string }) {
  const contentRef = useRef<HTMLDivElement>(null!)
  const [isReady, setIsReady] = useState(false)
  const onReady = useCallback(() => setIsReady(true), [])

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

          <div className="relative">
            <ContentEditable className="space-y-3 outline-none" />
            {!isReady && (
              <div className="absolute inset-0 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            )}
          </div>

          <EditorReadyPlugin onReady={onReady} />
          <SelectionMarkerPlugin containerRef={contentRef} />
          <FootnoteList />
        </div>
      </ScrollArea>
    </div>
  )
}
