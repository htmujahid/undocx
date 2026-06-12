"use client"

import { useMemo } from "react"

import { defineExtension } from "lexical"

import {
  HorizontalRuleExtension,
  TabIndentationExtension,
} from "@lexical/extension"
import { LinkExtension } from "@lexical/link"
import { ListExtension } from "@lexical/list"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer"
import { RichTextExtension } from "@lexical/rich-text"
import { TableExtension } from "@lexical/table"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FootnoteList,
  WordCount,
} from "@/components/workspace/content-preview-parts"
import { CalloutExtension } from "@/components/workspace/editor/callout-extension"
import { CodeHighlightExtension } from "@/components/workspace/editor/code-highlight-extension"
import { FootnoteExtension } from "@/components/workspace/editor/footnote-extension"
import { RENDERICAL_TRANSFORMERS } from "@/components/workspace/editor/markdown-transformers"
import { MathExtension } from "@/components/workspace/editor/math-extension"
import { SvgExtension } from "@/components/workspace/editor/svg-extension"
import { editorTheme } from "@/components/workspace/editor/theme"

export function PublicArtifactView({
  title,
  content,
  updatedAt,
}: {
  title: string
  content: string | null
  updatedAt: string
}) {
  const extension = useMemo(
    () =>
      defineExtension({
        name: "renderical/public-viewer",
        namespace: "public-viewer",
        theme: editorTheme,
        editable: false,
        ...(content
          ? {
              $initialEditorState: () =>
                $convertFromMarkdownString(content, RENDERICAL_TRANSFORMERS),
            }
          : {}),
        onError: (error: Error) => console.error("[Lexical]", error),
        dependencies: [
          RichTextExtension,
          ListExtension,
          LinkExtension,
          TableExtension,
          CodeHighlightExtension,
          SvgExtension,
          MathExtension,
          HorizontalRuleExtension,
          TabIndentationExtension,
          CalloutExtension,
          FootnoteExtension,
        ],
      }),
    [content]
  )

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-[720px] px-8 py-8">
          <div className="mb-6">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Shared document
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <WordCount />
              <span>·</span>
              <span>
                Updated{" "}
                {new Date(updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <Separator className="mb-6" />

          <ContentEditable className="space-y-3 outline-none" />

          <FootnoteList />
        </div>
      </ScrollArea>
    </LexicalExtensionComposer>
  )
}
