"use client"

import type { JSX } from "react"

import type {
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { DecoratorNode } from "lexical"

export type MathDisplay = "block" | "inline"

export type SerializedMathNode = Spread<
  { display: MathDisplay; html: string },
  SerializedLexicalNode
>

function MathRenderer({
  html,
  display,
}: {
  html: string
  display: MathDisplay
}) {
  if (display === "inline") {
    return (
      <span
        className="inline-block align-middle [&_math]:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return (
    <div
      className="my-4 overflow-x-auto [&_math]:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export class MathNode extends DecoratorNode<JSX.Element> {
  __html: string
  __display: MathDisplay

  static getType(): string {
    return "math"
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(node.__html, node.__display, node.__key)
  }

  static importJSON(serialized: SerializedMathNode): MathNode {
    return new MathNode(serialized.html, serialized.display)
  }

  constructor(html: string, display: MathDisplay = "block", key?: string) {
    super(key)
    this.__html = html
    this.__display = display
  }

  exportJSON(): SerializedMathNode {
    return {
      type: "math",
      version: 1,
      display: this.__display,
      html: this.__html,
    }
  }

  createDOM(): HTMLElement {
    return this.__display === "inline"
      ? document.createElement("span")
      : document.createElement("div")
  }

  updateDOM(): false {
    return false
  }

  isInline(): this["__display"] extends "inline" ? true : false {
    return (this.__display === "inline") as this["__display"] extends "inline"
      ? true
      : false
  }

  decorate(): JSX.Element {
    return <MathRenderer html={this.__html} display={this.__display} />
  }
}

export function $createMathNode(
  html: string,
  display: MathDisplay = "block"
): MathNode {
  return new MathNode(html, display)
}

export function $isMathNode(node: unknown): node is MathNode {
  return node instanceof MathNode
}
