"use client";

import { useState } from "react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BulletListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  Link2Icon,
  NumberedListIcon,
  ParagraphIcon,
  QuoteIcon,
  RedoIcon,
  RefreshCwIcon,
  RuleIcon,
  StrikethroughIcon,
  TableIcon,
  TaskListIcon,
  UndoIcon,
} from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { CommandPalette } from "./command-palette";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxField, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger, ComboboxValueIcon } from "~@/components/ui/combobox";
import { Toggle, ToggleGroup } from "~@/components/ui/toggle";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarSeparator } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

const blocks = [
  ["paragraph", "Paragraph", ParagraphIcon],
  ["h1", "Heading 1", Heading1Icon],
  ["h2", "Heading 2", Heading2Icon],
  ["h3", "Heading 3", Heading3Icon],
  ["numbers", "Numbered list", NumberedListIcon],
  ["bullets", "Bulleted list", BulletListIcon],
  ["tasks", "Task list", TaskListIcon],
  ["quote", "Quote", QuoteIcon],
] as const;

const fonts = [
  ["sans", "Sans", "font-sans"],
  ["serif", "Serif", "font-serif"],
  ["mono", "Mono", "font-mono"],
] as const;

const defaultFontFor = (block: string | null) => (block?.startsWith("h") ? "serif" : "sans");

const toggleClass = "size-8 justify-center border-0 bg-transparent px-0 data-pressed:bg-primary/10";

function TipButton({ tip, label, className, children }: { tip: string; label?: string; className?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton aria-label={label} className={className} />}>{children}</TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar() {
  const [block, setBlock] = useState<string | null>("paragraph");
  const [blockField, setBlockField] = useState<HTMLDivElement | null>(null);
  const [fontOverride, setFontOverride] = useState<string | null>(null);
  const [fontField, setFontField] = useState<HTMLDivElement | null>(null);
  const font = fontOverride ?? defaultFontFor(block);
  const chooseBlock = (next: string) => {
    setBlock(next);
    setFontOverride(null);
  };
  const [marks, setMarks] = useState<string[]>([]);
  const [align, setAlign] = useState<string[]>(["left"]);

  return (
    <div className="sticky top-0 z-[5] flex h-12 shrink-0 items-center justify-between gap-3 overflow-x-auto bg-background/95 px-4 shadow-[inset_0_-1px_0_var(--border)] backdrop-blur in-data-focus:hidden">
      <Toolbar aria-label="Formatting" className="shrink-0 flex-nowrap">
        <ToolbarGroup aria-label="History" className="flex shrink-0 items-center gap-1">
          <ToolbarButton aria-label="Undo">
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton aria-label="Redo" disabled>
            <RedoIcon />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <Combobox value={block} onValueChange={(next) => next && chooseBlock(next)} autoHighlight="always">
          <ComboboxLabel className="sr-only">Block style</ComboboxLabel>
          <ComboboxField ref={setBlockField} className="w-44 shrink-0">
            <ComboboxValueIcon />
            <ToolbarInput render={<ComboboxInput placeholder="Block style" className="font-medium" />} />
            <ComboboxTrigger aria-label="Show block styles" />
          </ComboboxField>
          <ComboboxContent anchor={blockField} className="w-48">
            <ComboboxEmpty>No style by that name.</ComboboxEmpty>
            <ComboboxList>
              {blocks.map(([value, label, Icon]) => (
                <ComboboxItem key={value} value={value} label={label} icon={<Icon />}>
                  {label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <Combobox value={font} onValueChange={(next) => next && setFontOverride(next)} autoHighlight="always">
          <ComboboxLabel className="sr-only">Font</ComboboxLabel>
          <ComboboxField ref={setFontField} className="w-28 shrink-0">
            <ToolbarInput render={<ComboboxInput placeholder="Font" className={cn("font-medium", fonts.find(([value]) => value === font)?.[2])} />} />
            <ComboboxTrigger aria-label="Show fonts" />
          </ComboboxField>
          <ComboboxContent anchor={fontField} className="w-40">
            <ComboboxEmpty>No font by that name.</ComboboxEmpty>
            <ComboboxList>
              {fonts.map(([value, label, className]) => (
                <ComboboxItem key={value} value={value} label={label} icon={<span className={cn("text-base leading-none", className)}>Aa</span>}>
                  {label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <ToolbarSeparator />
        <ToggleGroup multiple aria-label="Text formatting" value={marks} onValueChange={setMarks}>
          <Toggle value="bold" aria-label="Bold" className={toggleClass}>
            <BoldIcon />
          </Toggle>
          <Toggle value="italic" aria-label="Italic" className={toggleClass}>
            <ItalicIcon />
          </Toggle>
          <Toggle value="strike" aria-label="Strikethrough" className={toggleClass}>
            <StrikethroughIcon />
          </Toggle>
          <Toggle value="code" aria-label="Inline code" className={toggleClass}>
            <CodeIcon />
          </Toggle>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToggleGroup aria-label="Alignment" value={align} onValueChange={(next) => setAlign(next.length ? next : ["left"])}>
          <Toggle value="left" aria-label="Align left" className={toggleClass}>
            <AlignLeftIcon />
          </Toggle>
          <Toggle value="center" aria-label="Align centre" className={toggleClass}>
            <AlignCenterIcon />
          </Toggle>
          <Toggle value="right" aria-label="Align right" className={toggleClass}>
            <AlignRightIcon />
          </Toggle>
          <Toggle value="justify" aria-label="Justify" className={toggleClass}>
            <AlignJustifyIcon />
          </Toggle>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Insert" className="flex shrink-0 items-center gap-1">
          <ToolbarButton aria-label="Link">
            <Link2Icon />
          </ToolbarButton>
          <ToolbarButton aria-label="Table">
            <TableIcon />
          </ToolbarButton>
          <ToolbarButton aria-label="Horizontal rule">
            <RuleIcon />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      <div className="flex shrink-0 items-center gap-1">
      <Toolbar aria-label="Undocx" className="shrink-0 flex-nowrap">
        <TipButton tip="Rewrite the selected paragraph ⌘R" className="text-primary-deep hover:bg-primary/10">
          <RefreshCwIcon />
          Regenerate
        </TipButton>
      </Toolbar>
      <CommandPalette />
      </div>
    </div>
  );
}
