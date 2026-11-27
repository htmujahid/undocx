"use client";

import { AlignmentToggles } from "~@/editor/plugins/element-format";
import { BlockFormatSelect } from "~@/editor/plugins/block-format";
import { FontFamilySelect } from "~@/editor/plugins/font-family";
import { TextFormatToggles } from "~@/editor/plugins/text-format";
import { HorizontalRuleButton } from "~@/editor/plugins/horizontal-rule";
import { LayoutControl } from "~@/editor/plugins/layout";
import { PageBreakButton } from "~@/editor/plugins/page-break";
import { CiteControl } from "~@/editor/plugins/cite";
import { LinkControl } from "~@/editor/plugins/link";
import { TableControl } from "~@/editor/plugins/table";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "~@/components/ui/toolbar";

export function EditorToolbar() {
  return (
    <div className="sticky top-0 left-0 z-[5] flex h-12 shrink-0 items-center gap-3 overflow-x-auto bg-background/95 px-4 shadow-[inset_0_-1px_0_var(--border)] backdrop-blur in-data-focus:hidden">
      <Toolbar aria-label="Formatting" className="mx-auto shrink-0 flex-nowrap">
        <BlockFormatSelect />
        <ToolbarSeparator />
        <FontFamilySelect />
        <ToolbarSeparator />
        <TextFormatToggles />
        <ToolbarSeparator />
        <AlignmentToggles />
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Insert" className="flex shrink-0 items-center gap-1">
          <LinkControl />
          <CiteControl />
          <TableControl />
          <HorizontalRuleButton />
          <PageBreakButton />
          <LayoutControl />
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}
