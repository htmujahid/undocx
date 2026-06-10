import type { EditorConfig, LexicalEditor, SerializedLexicalNode, Spread } from "lexical"
import type { JSX } from "react"

import { DecoratorNode } from "lexical"

export type SerializedSvgNode = Spread<
  { html: string },
  SerializedLexicalNode
>

function SvgRenderer({ html }: { html: string }) {
  return (
    <div
      className="my-4 [&_svg]:mx-auto [&_svg]:block [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export class SvgNode extends DecoratorNode<JSX.Element> {
  __html: string

  static getType(): string {
    return "svg"
  }

  static clone(node: SvgNode): SvgNode {
    return new SvgNode(node.__html, node.__key)
  }

  static importJSON(serialized: SerializedSvgNode): SvgNode {
    return new SvgNode(serialized.html)
  }

  constructor(html: string, key?: string) {
    super(key)
    this.__html = html
  }

  exportJSON(): SerializedSvgNode {
    return { type: "svg", version: 1, html: this.__html }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement("div")
  }

  updateDOM(): false {
    return false
  }

  isInline(): false {
    return false
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return <SvgRenderer html={this.__html} />
  }
}

export function $createSvgNode(html: string): SvgNode {
  return new SvgNode(html)
}

export function $isSvgNode(node: unknown): node is SvgNode {
  return node instanceof SvgNode
}
