"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CheckIcon, ColumnsIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { cn } from "~@/lib/utils";
import { INSERT_LAYOUT_COMMAND, layoutTemplates, REMOVE_LAYOUT_COMMAND, UPDATE_LAYOUT_COMMAND, useLayout } from "../extensions/layout";

const triggerClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-primary/10 [&_svg]:size-4";

export function LayoutControl() {
  const [editor] = useLexicalComposerContext();
  const layout = useLayout();
  return (
    <Menu
      onAction={(value) => {
        const key = String(value);
        if (key === "remove" && layout) return editor.dispatchCommand(REMOVE_LAYOUT_COMMAND, layout.nodeKey);
        if (layout) return editor.dispatchCommand(UPDATE_LAYOUT_COMMAND, { template: key, nodeKey: layout.nodeKey });
        editor.dispatchCommand(INSERT_LAYOUT_COMMAND, key);
      }}
    >
      <Tooltip>
        <TooltipTrigger render={<MenuTrigger aria-label={layout ? "Columns layout" : "Insert columns"} className={cn(triggerClass, layout && "bg-primary/10")} />}>
          <ColumnsIcon />
        </TooltipTrigger>
        <TooltipContent>{layout ? "Columns layout" : "Insert columns"}</TooltipContent>
      </Tooltip>
      <MenuContent align="start" className="min-w-56">
        <MenuGroup>
          <MenuGroupLabel>{layout ? "Change columns" : "Insert columns"}</MenuGroupLabel>
          {layoutTemplates.map(({ label, value }) => (
            <MenuItem key={value} value={value} trailing={layout ? <CheckIcon className={cn("size-3.5 text-primary", layout.template === value ? "visible" : "invisible")} /> : undefined}>
              {label}
            </MenuItem>
          ))}
        </MenuGroup>
        {layout ? (
          <>
            <MenuSeparator />
            <MenuItem value="remove" destructive>
              Remove columns
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </Menu>
  );
}
