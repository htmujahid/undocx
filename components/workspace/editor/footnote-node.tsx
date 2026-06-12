"use client"

import type { JSX } from "react"
import { useSyncExternalStore } from "react"

import type { SerializedLexicalNode, Spread } from "lexical"
import { DecoratorNode } from "lexical"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { snapshotFootnotes, subscribeFootnotes } from "./footnote-store"

export type SerializedFootnoteNode = Spread<
  { text: string },
  SerializedLexicalNode
>

function FootnoteRenderer({ nodeKey }: { nodeKey: string }) {
  const [editor] = useLexicalComposerContext()
  const map = useSyncExternalStore(
    (cb) => subscribeFootnotes(editor, cb),
    () => snapshotFootnotes(editor)
  )
  const index = map.get(nodeKey)?.index ?? null

  return (
    <sup className="select-none font-mono text-[10px] font-medium text-muted-foreground">
      <a
        href={index !== null ? `#fn-${index}` : undefined}
        className="no-underline transition-colors hover:text-foreground"
      >
        [{index ?? "?"}]
      </a>
    </sup>
  )
}

export class FootnoteNode extends DecoratorNode<JSX.Element> {
  __content: string

  static getType(): string {
    return "footnote"
  }

  static clone(node: FootnoteNode): FootnoteNode {
    return new FootnoteNode(node.__content, node.__key)
  }

  static importJSON(serialized: SerializedFootnoteNode): FootnoteNode {
    return new FootnoteNode(serialized.text)
  }

  constructor(content: string, key?: string) {
    super(key)
    this.__content = content
  }

  exportJSON(): SerializedFootnoteNode {
    return {
      type: "footnote",
      version: 1,
      text: this.__content,
    }
  }

  createDOM(): HTMLElement {
    return document.createElement("span")
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): true {
    return true
  }

  decorate(): JSX.Element {
    return <FootnoteRenderer nodeKey={this.__key} />
  }
}

export function $createFootnoteNode(content: string): FootnoteNode {
  return new FootnoteNode(content)
}

export function $isFootnoteNode(node: unknown): node is FootnoteNode {
  return node instanceof FootnoteNode
}
