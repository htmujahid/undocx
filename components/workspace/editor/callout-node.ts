"use client"

import type {
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical"
import {
  ElementNode,
  addClassNamesToElement,
  removeClassNamesFromElement,
} from "lexical"

export type CalloutType = "note" | "tip" | "warning" | "danger"

export type SerializedCalloutNode = Spread<
  { calloutType: CalloutType },
  SerializedElementNode
>

const TYPE_CLASSES: Record<CalloutType, { border: string[]; icon: string[] }> =
  {
    note: { border: ["border-border"], icon: ["text-foreground"] },
    tip: { border: ["border-border"], icon: ["text-foreground"] },
    warning: { border: ["border-border"], icon: ["text-foreground"] },
    danger: { border: ["border-border"], icon: ["text-muted-foreground"] },
  }

// Lucide-compatible SVG paths, one per callout type.
const ICON_SVG: Record<CalloutType, string> = {
  note: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  tip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  danger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
}

const BASE_OUTER = [
  "my-4",
  "grid",
  "w-full",
  "grid-cols-[auto_1fr]",
  "items-start",
  "gap-x-2.5",
  "gap-y-0.5",
  "rounded-lg",
  "border",
  "bg-card",
  "px-4",
  "py-3",
  "text-sm",
  "text-card-foreground",
]

const BASE_ICON = ["size-4", "shrink-0", "translate-y-0.5", "row-span-2"]

function buildIcon(type: CalloutType): HTMLSpanElement {
  const wrap = document.createElement("span")
  addClassNamesToElement(wrap, ...BASE_ICON, ...TYPE_CLASSES[type].icon)
  wrap.innerHTML = ICON_SVG[type]
  return wrap
}

export class CalloutNode extends ElementNode {
  __calloutType: CalloutType

  static getType(): string {
    return "callout"
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__calloutType, node.__key)
  }

  static importJSON(serialized: SerializedCalloutNode): CalloutNode {
    const node = new CalloutNode(serialized.calloutType)
    node.setFormat(serialized.format)
    node.setIndent(serialized.indent)
    node.setDirection(serialized.direction)
    if (serialized.textFormat !== undefined)
      node.setTextFormat(serialized.textFormat)
    if (serialized.textStyle !== undefined)
      node.setTextStyle(serialized.textStyle)
    return node
  }

  constructor(calloutType: CalloutType = "note", key?: string) {
    super(key)
    this.__calloutType = calloutType
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      type: "callout",
      version: 1,
      calloutType: this.__calloutType,
    }
  }

  createDOM(): HTMLElement {
    const outer = document.createElement("div")
    addClassNamesToElement(
      outer,
      ...BASE_OUTER,
      ...TYPE_CLASSES[this.__calloutType].border
    )

    outer.appendChild(buildIcon(this.__calloutType))

    const content = document.createElement("div")
    content.className = "min-w-0"
    outer.appendChild(content)

    return outer
  }

  updateDOM(prevNode: CalloutNode, dom: HTMLElement): boolean {
    if (prevNode.__calloutType !== this.__calloutType) {
      removeClassNamesFromElement(
        dom,
        ...TYPE_CLASSES[prevNode.__calloutType].border
      )
      addClassNamesToElement(dom, ...TYPE_CLASSES[this.__calloutType].border)
      // Replace the icon span (first child) with a fresh one.
      dom.replaceChild(buildIcon(this.__calloutType), dom.firstElementChild!)
    }
    return false
  }

  getDOMSlot(element: HTMLElement) {
    return super.getDOMSlot(element.lastElementChild as HTMLElement)
  }

  isInline(): false {
    return false
  }
}

export function $createCalloutNode(
  calloutType: CalloutType = "note"
): CalloutNode {
  return new CalloutNode(calloutType)
}

export function $isCalloutNode(
  node: LexicalNode | null | undefined
): node is CalloutNode {
  return node instanceof CalloutNode
}
