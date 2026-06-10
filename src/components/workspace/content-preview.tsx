import { useEffect, useState } from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { $getRoot } from "lexical"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

function WordCount() {
  const [editor] = useLexicalComposerContext()
  const [count, setCount] = useState(0)

  useEffect(() => {
    editor.getEditorState().read(() => {
      setCount(countWords($getRoot().getTextContent()))
    })
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setCount(countWords($getRoot().getTextContent()))
      })
    })
  }, [editor])

  return <span>{count.toLocaleString()} words</span>
}

export function ContentPreview() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-[720px] px-8 py-8">
          {/* Document header — not controlled by Lexical */}
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Generated document
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Introduction to Machine Learning
            </h1>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <WordCount />
              <span>·</span>
              <span>Just now</span>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Lexical readonly content — editor root element */}
          <ContentEditable className="space-y-3 outline-none" />
        </div>
      </ScrollArea>
    </div>
  )
}
