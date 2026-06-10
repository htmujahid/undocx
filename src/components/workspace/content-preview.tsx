import { ContentEditable } from "@lexical/react/LexicalContentEditable"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function ContentPreview() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-2xl px-8 py-8">
          {/* Document header — not controlled by Lexical */}
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Generated document
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Introduction to Machine Learning
            </h1>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>5 layers</span>
              <span>·</span>
              <span>~420 words</span>
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
