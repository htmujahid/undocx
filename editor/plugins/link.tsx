"use client";

import { EditorStateExtension } from "@lexical/extension";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { useState, type FormEvent } from "react";
import { Button } from "~@/components/ui/button";
import { ExternalLinkIcon, Link2Icon, UnlinkIcon } from "~@/components/ui/icons";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "~@/components/ui/popover";
import { Toggle } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export function isValidUrl(url: string) {
  try {
    return allowedProtocols.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string) {
  const value = input.trim();
  if (!value) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return isValidUrl(value) ? value : null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  const withScheme = `https://${value}`;
  return isValidUrl(withScheme) && /\./.test(value) ? withScheme : null;
}

export function $getLink() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return { url: "", isLink: false, canLink: false };
  const link = $findMatchingParent(selection.anchor.getNode(), $isLinkNode);
  const isLink = link !== null;
  return { url: isLink ? link.getURL() : "", isLink, canLink: isLink || !selection.isCollapsed() };
}

export function useLink() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getLink());
}

const toggleClass = "size-8 justify-center border-0 bg-transparent px-0 data-pressed:bg-primary/10";

export function LinkControl() {
  const [editor] = useLexicalComposerContext();
  const { url, isLink, canLink } = useLink();
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = normalizeUrl(String(new FormData(event.currentTarget).get("url") ?? ""));
    if (!next) return setInvalid(true);
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, next);
    setOpen(false);
  }

  function remove() {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setInvalid(false);
      }}
    >
      <Tooltip>
        <TooltipTrigger render={<PopoverTrigger render={<Toggle aria-label="Link" pressed={isLink} disabled={!canLink} className={toggleClass} />} />}>
          <Link2Icon />
        </TooltipTrigger>
        <TooltipContent>{isLink ? "Edit link" : "Link"}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80" initialFocus="input">
        <form onSubmit={submit} className="grid gap-2">
          <PopoverTitle>{isLink ? "Edit link" : "Add link"}</PopoverTitle>
          <input
            key={url}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            defaultValue={url}
            placeholder="example.com or name@example.com"
            aria-label="Link address"
            aria-invalid={invalid || undefined}
            onChange={() => setInvalid(false)}
            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-invalid:border-destructive"
          />
          {invalid ? (
            <p role="alert" className="m-0 text-xs text-destructive">
              Enter a web address or email.
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {isLink ? (
                <>
                  <Button type="button" size="sm" variant="ghost" onClick={() => window.open(url, "_blank", "noopener")}>
                    <ExternalLinkIcon />
                    Open
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={remove}>
                    <UnlinkIcon />
                    Remove
                  </Button>
                </>
              ) : null}
            </div>
            <Button type="submit" size="sm" variant="primary">
              {isLink ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
