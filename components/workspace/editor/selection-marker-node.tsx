"use client"

import type { ReactElement } from "react"

import type {
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $getRoot, DecoratorNode } from "lexical"
import { XIcon } from "lucide-react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

export type MarkerRole = "start" | "end" | "removed-start" | "removed-end"

export type SerializedSelectionMarkerNode = Spread<
  { type: "selection-marker"; role: MarkerRole; version: 1 },
  SerializedLexicalNode
>

function SelectionMarkerComponent({
  role,
}: {
  nodeKey: NodeKey
  role: MarkerRole
}) {
  const [editor] = useLexicalComposerContext()

  const removeAll = () => {
    editor.update(() => {
      $getRoot()
        .getChildren()
        .filter(
          (n): n is SelectionMarkerNode => n instanceof SelectionMarkerNode
        )
        .forEach((n) => n.remove())
    })
  }

  return (
    <div
      contentEditable={false}
      data-lexical-decorator="true"
      data-marker-role={role}
      className="group my-1.5 flex select-none items-center gap-2"
    >
      {role === "start" ? (
        <>
          <div className="flex shrink-0 items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5">
            <svg
              viewBox="0 0 8 8"
              className="size-2 fill-primary/70"
              aria-hidden="true"
            >
              <rect x="0" y="4.5" width="8" height="1.2" />
              <polygon points="4,0.5 7,4.5 1,4.5" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/65">
              Start
            </span>
          </div>
          <div
            className="h-px flex-1"
            style={{
              background:
                "repeating-linear-gradient(90deg, hsl(var(--primary)/0.25) 0, hsl(var(--primary)/0.25) 4px, transparent 4px, transparent 8px)",
            }}
          />
          <button
            onClick={removeAll}
            type="button"
            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
            title="Remove selection"
          >
            <XIcon className="size-3 text-muted-foreground" />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={removeAll}
            type="button"
            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
            title="Remove selection"
          >
            <XIcon className="size-3 text-muted-foreground" />
          </button>
          <div
            className="h-px flex-1"
            style={{
              background:
                "repeating-linear-gradient(90deg, hsl(var(--primary)/0.25) 0, hsl(var(--primary)/0.25) 4px, transparent 4px, transparent 8px)",
            }}
          />
          <div className="flex shrink-0 items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/65">
              End
            </span>
            <svg
              viewBox="0 0 8 8"
              className="size-2 fill-primary/70"
              aria-hidden="true"
            >
              <rect x="0" y="2.3" width="8" height="1.2" />
              <polygon points="4,7.5 7,3.5 1,3.5" />
            </svg>
          </div>
        </>
      )}
    </div>
  )
}

export class SelectionMarkerNode extends DecoratorNode<ReactElement> {
  __role: MarkerRole

  static getType(): string {
    return "selection-marker"
  }

  static clone(node: SelectionMarkerNode): SelectionMarkerNode {
    return new SelectionMarkerNode(node.__role, node.__key)
  }

  static importJSON(json: SerializedSelectionMarkerNode): SelectionMarkerNode {
    return new SelectionMarkerNode(json.role)
  }

  constructor(role: MarkerRole, key?: NodeKey) {
    super(key)
    this.__role = role
  }

  createDOM(): HTMLElement {
    return document.createElement("div")
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedSelectionMarkerNode {
    return {
      ...super.exportJSON(),
      type: "selection-marker",
      role: this.__role,
      version: 1,
    }
  }

  isInline(): false {
    return false
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  decorate(): ReactElement {
    return <SelectionMarkerComponent nodeKey={this.__key} role={this.__role} />
  }
}

export function $createSelectionMarkerNode(
  role: MarkerRole
): SelectionMarkerNode {
  return new SelectionMarkerNode(role)
}

export function $isSelectionMarkerNode(
  node: LexicalNode | null | undefined
): node is SelectionMarkerNode {
  return node instanceof SelectionMarkerNode
}
