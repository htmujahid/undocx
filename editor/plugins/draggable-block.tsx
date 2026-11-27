"use client";

import { $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { $copyNode, $createParagraphNode, $getRoot, $getSelection, $getState, $isElementNode, $isParagraphNode, $setState, type LexicalEditor, type LexicalNode } from "lexical";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowDownIcon, ArrowUpIcon, AssistantIcon, ClipboardIcon, ColumnsIcon, DuplicateIcon, GripIcon, LockIcon, LockOpenIcon, NoteIcon, RefreshCwIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { $isLocked, $kindOf, AI_ASK_COMMAND, AI_REGENERATE_COMMAND, AI_VARIATIONS_COMMAND } from "../extensions/ai-edits";
import { ADD_NOTE_COMMAND } from "../extensions/notes";
import { lockedState, toggleSelectedBlockLock } from "../extensions/lock";
import { MM_TO_PX, resolveMargins, usePageSettings } from "../extensions/page";

const PLUGIN_HANDLE_OFFSET = 4;
const PLUGIN_LINE_OFFSET = 24;
const HANDLE_WIDTH = 24;
const HANDLE_GAP = 6;

function handleX(leftPx: number) {
  return leftPx >= HANDLE_WIDTH + HANDLE_GAP ? leftPx - HANDLE_WIDTH - HANDLE_GAP : -HANDLE_WIDTH;
}

type BlockInfo = { locked: boolean; isFirst: boolean; isLast: boolean; canNote: boolean; canEdit: boolean; isHeading: boolean };

const closedInfo: BlockInfo = { locked: false, isFirst: true, isLast: true, canNote: false, canEdit: false, isHeading: false };

function $blockOf(editor: LexicalEditor, element: HTMLElement) {
  return $getRoot()
    .getChildren()
    .find((child) => editor.getElementByKey(child.getKey()) === element);
}

function $cloneDeep<T extends LexicalNode>(node: T): T {
  const copy = $copyNode(node);
  if ($isElementNode(node) && $isElementNode(copy)) {
    for (const child of node.getChildren()) copy.append($cloneDeep(child));
  }
  return copy;
}

function $readInfo(node: LexicalNode): BlockInfo {
  return {
    locked: $getState(node, lockedState),
    isFirst: node.getPreviousSibling() === null,
    isLast: node.getNextSibling() === null,
    canNote: $isParagraphNode(node) || $isHeadingNode(node) || $isQuoteNode(node) || $isListNode(node),
    canEdit: $kindOf(node) !== "other" && !$isLocked(node),
    isHeading: $isHeadingNode(node),
  };
}

function isTyping() {
  const element = document.activeElement;
  return element instanceof HTMLElement && element.matches("input, textarea, select");
}

export function DraggableBlock({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const activeRef = useRef<HTMLElement | null>(null);
  const skipRefocusRef = useRef(false);
  const [blockElem, setBlockElem] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(closedInfo);
  const [armed, setArmed] = useState(false);
  const { left, right } = resolveMargins(usePageSettings());
  const leftPx = left * MM_TO_PX;
  const rightPx = right * MM_TO_PX;

  useShortcut("mod+l", () => toggleSelectedBlockLock(editor), { description: "Lock or unlock the block", when: () => !isTyping() });

  function isOnMenu(element: HTMLElement) {
    return isOpenRef.current || element.closest("[data-drag-handle]") !== null;
  }

  function handleOpenChange(next: boolean, details?: { event?: Event; reason?: string; cancel: () => void }) {
    const type = details?.event?.type;
    if (details?.reason === "trigger-press" && (type === "mousedown" || type === "pointerdown")) {
      details.cancel();
      return;
    }
    isOpenRef.current = next;
    setOpen(next);
    setArmed(false);
    if (!next) {
      const skip = skipRefocusRef.current;
      skipRefocusRef.current = false;
      if (!skip && editor.read(() => $getSelection() !== null)) editor.focus();
      return;
    }
    activeRef.current = blockElem;
    if (!blockElem) return;
    editor.read(() => {
      const node = $blockOf(editor, blockElem);
      if (node) setInfo($readInfo(node));
    });
  }

  function handleAction(action: string) {
    const element = activeRef.current;
    if (!element) return;
    if (action === "copy") {
      editor.read(() => {
        const node = $blockOf(editor, element);
        if (node) void navigator.clipboard.writeText(node.getTextContent());
      });
      return;
    }
    if (action === "delete" && info.locked && !armed) {
      setArmed(true);
      return;
    }
    if (action === "regenerate" || action === "regenerate-section" || action === "variations" || action === "ask") {
      const key = editor.read(() => $blockOf(editor, element)?.getKey());
      if (!key) return;
      skipRefocusRef.current = true;
      if (action === "regenerate") editor.dispatchCommand(AI_REGENERATE_COMMAND, { key, scope: "block" });
      if (action === "regenerate-section") editor.dispatchCommand(AI_REGENERATE_COMMAND, { key, scope: "section" });
      if (action === "variations") editor.dispatchCommand(AI_VARIATIONS_COMMAND, { key: info.canEdit ? key : null });
      if (action === "ask") editor.dispatchCommand(AI_ASK_COMMAND, { key });
      return;
    }
    if (action === "note") skipRefocusRef.current = true;
    editor.update(() => {
      const node = $blockOf(editor, element);
      if (!node) return;
      switch (action) {
        case "lock":
          $setState(node, lockedState, (current) => !current);
          break;
        case "note":
          editor.dispatchCommand(ADD_NOTE_COMMAND, node.getKey());
          break;
        case "duplicate": {
          const copy = $cloneDeep(node);
          $setState(copy, lockedState, false);
          node.insertAfter(copy);
          break;
        }
        case "move-up":
          node.getPreviousSibling()?.insertBefore(node);
          break;
        case "move-down":
          node.getNextSibling()?.insertAfter(node);
          break;
        case "delete": {
          node.remove();
          const root = $getRoot();
          if (root.getChildrenSize() === 0) root.append($createParagraphNode());
          break;
        }
      }
    });
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      isOnMenu={isOnMenu}
      onElementChanged={setBlockElem}
      menuComponent={
        <div
          ref={menuRef}
          data-drag-handle
          data-menu-open={open || undefined}
          style={{ marginLeft: handleX(leftPx) - PLUGIN_HANDLE_OFFSET }}
          className="absolute top-0 left-0 hidden items-center rounded-sm opacity-0 will-change-transform data-menu-open:flex!"
        >
          <Menu open={open} onOpenChange={handleOpenChange} onAction={handleAction}>
            <MenuTrigger
              aria-label="Block actions"
              title="Drag to move, click for actions"
              onClick={(event) => event.detail > 0 && handleOpenChange(!open)}
              className="flex size-6 cursor-grab items-center justify-center rounded-sm text-faint-foreground outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing data-popup-open:bg-muted data-popup-open:text-foreground"
            >
              <GripIcon className="size-4" />
            </MenuTrigger>
            <MenuContent align="start" side="bottom" finalFocus="none" className="min-w-60">
              <MenuGroup>
                <MenuItem value="regenerate" icon={<RefreshCwIcon />} disabled={!info.canEdit}>
                  Regenerate
                </MenuItem>
                {info.isHeading ? (
                  <MenuItem value="regenerate-section" icon={<RefreshCwIcon />} disabled={info.locked}>
                    Regenerate section
                  </MenuItem>
                ) : null}
                <MenuItem value="variations" icon={<ColumnsIcon />} disabled={!info.canEdit}>
                  Three variations
                </MenuItem>
                <MenuItem value="ask" icon={<AssistantIcon />} disabled={!info.canNote}>
                  Ask Undocx about this
                </MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem value="lock" icon={info.locked ? <LockOpenIcon /> : <LockIcon />}>
                  {info.locked ? "Unlock block" : "Lock as final"}
                </MenuItem>
                <MenuItem value="note" icon={<NoteIcon />} disabled={!info.canNote}>
                  Add a note to this block
                </MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem value="duplicate" icon={<DuplicateIcon />}>
                  Duplicate
                </MenuItem>
                <MenuItem value="move-up" icon={<ArrowUpIcon />} disabled={info.isFirst}>
                  Move up
                </MenuItem>
                <MenuItem value="move-down" icon={<ArrowDownIcon />} disabled={info.isLast}>
                  Move down
                </MenuItem>
                <MenuItem value="copy" icon={<ClipboardIcon />}>
                  Copy text
                </MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuItem value="delete" icon={<TrashIcon />} destructive closeOnSelect={!info.locked || armed}>
                {info.locked && !armed ? "Delete locked block" : armed ? "Click again to delete" : "Delete"}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      }
      targetLineComponent={
        <div
          ref={targetLineRef}
          style={{ marginLeft: leftPx - PLUGIN_LINE_OFFSET, "--line-width": `calc(100% - ${leftPx + rightPx}px)` } as CSSProperties}
          className="pointer-events-none absolute top-0 left-0 flex h-1 w-(--line-width)! items-center opacity-0 will-change-transform"
        >
          <div className="h-0.5 flex-1 rounded-full bg-primary-deep" />
        </div>
      }
    />
  );
}
