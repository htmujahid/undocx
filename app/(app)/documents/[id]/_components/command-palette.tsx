"use client";

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~@/components/ui/command";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~@/components/ui/dialog";
import {
  ColumnsIcon,
  DownloadIcon,
  FileTextIcon,
  FocusIcon,
  LockIcon,
  NoteIcon,
  RefreshCwIcon,
} from "~@/components/ui/icons";
import { Toolbar, ToolbarButton } from "~@/components/ui/toolbar";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Toolbar aria-label="Palette" className="shrink-0">
        <DialogTrigger
          shortcut="mod+k"
          render={
            <ToolbarButton
              aria-label="Command palette"
              className="text-muted-foreground"
            />
          }
        >
          <kbd className="font-sans">⌘K</kbd>
        </DialogTrigger>
      </Toolbar>
      <DialogBackdrop />
      <DialogContent
        initialFocus="input"
        className="top-[18vh] -translate-y-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Every action, section and source, by name.
        </DialogDescription>
        <Command filter="fuzzy" onAction={() => setIsOpen(false)}>
          <CommandInput
            aria-label="Search actions, sections and sources"
            placeholder="Regenerate shorter, lock this, go to Investment…"
          />
          <CommandEmpty>Nothing by that name.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandGroupLabel>This paragraph</CommandGroupLabel>
              <CommandItem value="regenerate" shortcut="mod+r">
                <CommandItemIcon>
                  <RefreshCwIcon />
                </CommandItemIcon>
                Regenerate with an instruction
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="variations" shortcut="mod+shift+v">
                <CommandItemIcon>
                  <ColumnsIcon />
                </CommandItemIcon>
                Three variations
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="lock" shortcut="mod+l">
                <CommandItemIcon>
                  <LockIcon />
                </CommandItemIcon>
                Lock as final
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="note" shortcut="mod+shift+n">
                <CommandItemIcon>
                  <NoteIcon />
                </CommandItemIcon>
                Add a note to myself
                <CommandShortcut />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandGroupLabel>Go to</CommandGroupLabel>
              {[
                "Summary",
                "What we heard",
                "Scope of work",
                "Timeline",
                "Investment",
                "Next steps",
              ].map((section, index) => (
                <CommandItem key={section} value={`go-${index + 1}`}>
                  <CommandItemIcon className="font-serif text-primary">
                    {index + 1}
                  </CommandItemIcon>
                  {section}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandGroupLabel>Sources</CommandGroupLabel>
              {[
                "Sales export 2025.xlsx",
                "Shopify analytics, Jan to Dec 2025",
                "Staff interview notes.docx",
              ].map((source) => (
                <CommandItem key={source} value={source}>
                  <CommandItemIcon>
                    <FileTextIcon />
                  </CommandItemIcon>
                  {source}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandGroupLabel>Document</CommandGroupLabel>
              <CommandItem value="focus" shortcut="mod+shift+f">
                <CommandItemIcon>
                  <FocusIcon />
                </CommandItemIcon>
                Focus mode
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="export" shortcut="mod+e">
                <CommandItemIcon>
                  <DownloadIcon />
                </CommandItemIcon>
                Export…
                <CommandShortcut />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
