"use client";

import { EditorStateExtension } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $getSelection, $isRangeSelection } from "lexical";
import { CitationIcon, FileTextIcon, PlusIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { ToolbarButton } from "~@/components/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { useSources } from "../extensions/sources";

const ADD_SOURCE = "add-source";

const triggerClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-primary/10 [&_svg]:size-4";

export function $canCite() {
  return $isRangeSelection($getSelection());
}

export function useCanCite() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read($canCite);
}

export function CiteControl() {
  const [editor] = useLexicalComposerContext();
  const { sources, order, cite, startAdding } = useSources();
  const canCite = useCanCite();
  if (!canCite) {
    return (
      <Tooltip>
        <TooltipTrigger render={<ToolbarButton aria-label="Cite a source" aria-disabled="true" className="opacity-40 hover:bg-transparent" />}>
          <CitationIcon />
        </TooltipTrigger>
        <TooltipContent>Place the cursor in the text to cite a source</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Menu onAction={(value) => (value === ADD_SOURCE ? startAdding() : cite(value))}>
      <Tooltip>
        <TooltipTrigger render={<MenuTrigger aria-label="Cite a source" className={triggerClass} />}>
          <CitationIcon />
        </TooltipTrigger>
        <TooltipContent>Cite a source at the cursor</TooltipContent>
      </Tooltip>
      <MenuContent align="start" className="min-w-64" finalFocus={() => editor.getRootElement()}>
        {sources.length > 0 ? (
          <>
            <MenuGroup>
              <MenuGroupLabel>Cite at the cursor</MenuGroupLabel>
              {sources.map((source) => {
                const number = order.indexOf(source.id) + 1;
                return (
                  <MenuItem key={source.id} value={source.id} icon={<FileTextIcon />} trailing={number > 0 ? <span className="text-xs text-primary tabular-nums">{number}</span> : undefined}>
                    {source.title}
                  </MenuItem>
                );
              })}
            </MenuGroup>
            <MenuSeparator />
          </>
        ) : null}
        <MenuItem value={ADD_SOURCE} icon={<PlusIcon />}>
          Add a source…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
