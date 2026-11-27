"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PageBreakIcon } from "~@/components/ui/icons";
import { ToolbarButton } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { INSERT_PAGE_BREAK_COMMAND, usePageSettings } from "../extensions/page";

export function PageBreakButton() {
  const [editor] = useLexicalComposerContext();
  const isPageless = usePageSettings().layout === "pageless";
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton aria-label="Page break" onClick={() => editor.dispatchCommand(INSERT_PAGE_BREAK_COMMAND, undefined)} />}>
        <PageBreakIcon />
      </TooltipTrigger>
      <TooltipContent>{isPageless ? "Page break (applies in Pages layout)" : "Page break"}</TooltipContent>
    </Tooltip>
  );
}
