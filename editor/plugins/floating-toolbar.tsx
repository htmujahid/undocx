"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getSelection, $isRangeSelection, getDOMSelection, getDOMSelectionRangeAndPoints, getParentElement, mergeRegister, registerEventListener, registerEventListeners, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ADD_NOTE_COMMAND } from "../extensions/notes";
import { AssistantIcon, ChevronDownIcon, ClaimsCheckIcon, ColumnsIcon, NoteIcon, SparkleIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

const GAP = 10;
const EDGE = 8;
const STICKY_TOOLBAR_HEIGHT = 56;

type SoonGroup = { title: string; items: string[] };

const rewriteGroups: SoonGroup[] = [
  { title: "Rewrite with", items: ["Cut to half the length", "Plainer, for a non-technical reader", "Lead with what the customer gets", "Lead with the number"] },
  { title: "Change the tone", items: ["More direct", "Warmer", "More formal"] },
  { title: "Keep to", items: ["Match my voice", "Apply my house rules"] },
];

const claimGroups: SoonGroup[] = [
  { title: "This selection", items: ["Check its numbers and dates", "Find a source for it", "Mark as my estimate", "Show where a number came from"] },
];

const iconTriggerClass = "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-primary/10 [&_svg]:size-4";

const triggerClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-primary-deep outline-none hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-primary/10 [&_svg]:size-4";

function SoonButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton aria-label={label} aria-disabled="true" className="text-muted-foreground opacity-60 hover:bg-transparent" />}>{children}</TooltipTrigger>
      <TooltipContent>{label} · coming soon</TooltipContent>
    </Tooltip>
  );
}

function SoonMenu({ label, tip, groups, custom, className, children }: { label: string; tip: string; groups: SoonGroup[]; custom?: string; className: string; children: React.ReactNode }) {
  const soon = <span className="text-xs text-faint-foreground">Soon</span>;
  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger render={<MenuTrigger aria-label={label} className={className} />}>{children}</TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
      <MenuContent align="start" className="min-w-64">
        {groups.map((group, index) => (
          <Fragment key={group.title}>
            {index > 0 ? <MenuSeparator /> : null}
            <MenuGroup>
              <MenuGroupLabel>{group.title}</MenuGroupLabel>
              {group.items.map((item) => (
                <MenuItem key={item} value={item} disabled trailing={soon}>
                  {item}
                </MenuItem>
              ))}
            </MenuGroup>
          </Fragment>
        ))}
        {custom ? (
          <>
            <MenuSeparator />
            <MenuItem value="custom" disabled trailing={soon}>
              {custom}
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </Menu>
  );
}

export function FloatingToolbar({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const ref = useRef<HTMLDivElement>(null);
  const isPointerDown = useRef(false);
  const [visible, setVisible] = useState(false);

  const update = useCallback(() => {
    const element = ref.current;
    const rootElement = editor.getRootElement();
    const nativeSelection = getDOMSelection(anchorElem.ownerDocument.defaultView);
    if (!element || !rootElement || !nativeSelection || isPointerDown.current || editor.isComposing()) {
      setVisible(false);
      return;
    }
    const hasText = editor.read("latest", () => {
      const selection = $getSelection();
      return $isRangeSelection(selection) && !selection.isCollapsed() && selection.getTextContent().replace(/\n/g, "") !== "";
    });
    if (!hasText) {
      setVisible(false);
      return;
    }
    const { points, range } = getDOMSelectionRangeAndPoints(nativeSelection, rootElement);
    if (!range || !rootElement.contains(points.anchorNode)) {
      setVisible(false);
      return;
    }
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 || rect.height > 0);
    const first = rects[0] ?? range.getBoundingClientRect();
    const last = rects[rects.length - 1] ?? first;
    const anchorRect = anchorElem.getBoundingClientRect();
    const scrollerTop = (anchorElem.closest("[data-scroller]") ?? getParentElement(anchorElem))?.getBoundingClientRect().top ?? 0;
    const { offsetWidth: width, offsetHeight: height } = element;

    let top = first.top - height - GAP;
    if (top < scrollerTop + STICKY_TOOLBAR_HEIGHT) top = last.bottom + GAP;
    const left = Math.min(Math.max(first.left + first.width / 2 - width / 2, anchorRect.left + EDGE), anchorRect.right - width - EDGE);

    element.style.transform = `translate(${left - anchorRect.left}px, ${top - anchorRect.top}px)`;
    setVisible(true);
  }, [editor, anchorElem]);

  useEffect(() => {
    const scroller = anchorElem.closest<HTMLElement>("[data-scroller]") ?? getParentElement(anchorElem);
    return mergeRegister(
      registerEventListener(document, "selectionchange", update),
      registerEventListener(window, "resize", update),
      scroller ? registerEventListener(scroller, "scroll", update) : () => {},
      registerEventListeners(
        document,
        {
          pointerdown: (event) => {
            if (ref.current?.contains(event.target as Node)) return;
            isPointerDown.current = true;
            setVisible(false);
          },
          pointerup: () => {
            if (!isPointerDown.current) return;
            isPointerDown.current = false;
            update();
          },
        },
        true,
      ),
      editor.registerUpdateListener(update),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          update();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, anchorElem, update]);

  if (!isEditable) return null;

  return createPortal(
    <div
      ref={ref}
      data-visible={visible || undefined}
      onMouseDown={(event) => event.preventDefault()}
      className="invisible absolute top-0 left-0 z-10 w-max rounded-md border border-border bg-popover p-1 text-popover-foreground opacity-0 shadow-md transition-opacity duration-100 will-change-transform data-visible:visible data-visible:opacity-100 motion-reduce:transition-none"
    >
      <Toolbar aria-label="Selection" className="gap-0.5">
        <SoonMenu label="Rewrite selection" tip="Rewrite only this selection" groups={rewriteGroups} custom="Write your own instruction…" className={triggerClass}>
          <SparkleIcon />
          Rewrite
          <ChevronDownIcon className="size-3!" />
        </SoonMenu>
        <SoonButton label="Ask Undocx about this">
          <AssistantIcon />
        </SoonButton>
        <ToolbarSeparator />
        <SoonButton label="Three variations">
          <ColumnsIcon />
        </SoonButton>
        <SoonMenu label="Check claims" tip="Check the claims in this selection" groups={claimGroups} className={iconTriggerClass}>
          <ClaimsCheckIcon />
        </SoonMenu>
        <Tooltip>
          <TooltipTrigger render={<ToolbarButton aria-label="Add a note" onClick={() => editor.dispatchCommand(ADD_NOTE_COMMAND, undefined)} />}>
            <NoteIcon />
          </TooltipTrigger>
          <TooltipContent>Add a note to yourself</TooltipContent>
        </Tooltip>
      </Toolbar>
    </div>,
    anchorElem,
  );
}
