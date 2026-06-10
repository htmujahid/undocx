import type { EditorConfig, LexicalEditor, SerializedLexicalNode, SerializedTextNode, Spread } from "lexical"
import type { JSX } from "react"

import { DecoratorNode } from "lexical"

export type HtmlNodeDisplay = "block" | "inline"

export type SerializedHtmlNode = Spread<
  { display: HtmlNodeDisplay; children: SerializedTextNode[] },
  SerializedLexicalNode
>

function HtmlRenderer({ html, display }: { html: string; display: HtmlNodeDisplay }) {
  if (display === "inline") {
    return <span className="inline-block align-middle [&_math]:text-sm" dangerouslySetInnerHTML={{ __html: html }} />
  }
  return (
    <div
      className="my-4 overflow-x-auto [&_math]:text-sm [&_svg]:mx-auto [&_svg]:block [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export class HtmlNode extends DecoratorNode<JSX.Element> {
  __html: string
  __display: HtmlNodeDisplay

  static getType(): string {
    return "html"
  }

  static clone(node: HtmlNode): HtmlNode {
    return new HtmlNode(node.__html, node.__display, node.__key)
  }

  static importJSON(serialized: SerializedHtmlNode): HtmlNode {
    const html = serialized.children.map(c => c.text).join("")
    return new HtmlNode(html, serialized.display)
  }

  constructor(html: string, display: HtmlNodeDisplay = "block", key?: string) {
    super(key)
    this.__html = html
    this.__display = display
  }

  exportJSON(): SerializedHtmlNode {
    return {
      type: "html",
      version: 1,
      display: this.__display,
      children: [
        {
          type: "text",
          version: 1,
          text: this.__html,
          format: 0,
          detail: 0,
          mode: "normal",
          style: "",
        },
      ],
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return this.__display === "inline"
      ? document.createElement("span")
      : document.createElement("div")
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return this.__display === "inline"
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return <HtmlRenderer html={this.__html} display={this.__display} />
  }
}

export function $createHtmlNode(html: string, display: HtmlNodeDisplay = "block"): HtmlNode {
  return new HtmlNode(html, display)
}

export function $isHtmlNode(node: unknown): node is HtmlNode {
  return node instanceof HtmlNode
}
