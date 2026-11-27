"use client";

import { usePanel } from "~@/editor/extensions/panel";
import { FocusIcon, UnfocusIcon } from "~@/components/ui/icons";
import { Toggle } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

export function FocusToggle() {
  const { isFocus, setFocus } = usePanel();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            aria-label={isFocus ? "Leave focus mode" : "Focus mode"}
            pressed={isFocus}
            onPressedChange={setFocus}
            className="h-6 gap-1.5 border-0 bg-transparent px-1.5 text-xs font-normal text-muted-foreground hover:bg-muted hover:text-foreground data-pressed:bg-muted data-pressed:text-foreground [&_svg]:size-3.5"
          />
        }
      >
        {isFocus ? <UnfocusIcon /> : <FocusIcon />}
        Focus
      </TooltipTrigger>
      <TooltipContent>Focus mode, just the page</TooltipContent>
    </Tooltip>
  );
}
