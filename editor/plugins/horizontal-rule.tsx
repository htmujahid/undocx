"use client";

import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RuleIcon } from "~@/components/ui/icons";
import { ToolbarButton } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

export function HorizontalRuleButton() {
  const [editor] = useLexicalComposerContext();
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton aria-label="Horizontal rule" onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)} />}>
        <RuleIcon />
      </TooltipTrigger>
      <TooltipContent>Horizontal rule</TooltipContent>
    </Tooltip>
  );
}
