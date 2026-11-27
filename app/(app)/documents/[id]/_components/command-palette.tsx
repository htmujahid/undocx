"use client";

import { useShortcut } from "@ui-sdk/react/shortcuts";
import { useState } from "react";
import { useNotes } from "~@/editor/extensions/notes";
import { useSources } from "~@/editor/extensions/sources";
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
} from "~@/components/ui/dialog";
import {
  ColumnsIcon,
  DownloadIcon,
  FileTextIcon,
  FocusIcon,
  LockIcon,
  NoteIcon,
  PlusIcon,
  RefreshCwIcon,
} from "~@/components/ui/icons";

export function CommandPalette() {
  const { show } = useNotes();
  const { sources, cite, startAdding } = useSources();
  const [isOpen, setIsOpen] = useState(false);
  useShortcut("mod+k", () => setIsOpen(true), { description: "Command palette" });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogBackdrop />
      <DialogContent
        initialFocus="input"
        className="top-[18vh] -translate-y-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Every action, section and source, by name.
        </DialogDescription>
        <Command
          filter="fuzzy"
          onAction={(value) => {
            setIsOpen(false);
            if (value === "note") show();
            else if (value === "add-source") startAdding();
            else if (value.startsWith("cite:")) cite(value.slice(5));
          }}
        >
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
              <CommandGroupLabel>Cite a source</CommandGroupLabel>
              {sources.map((source) => (
                <CommandItem key={source.id} value={`cite:${source.id}`}>
                  <CommandItemIcon>
                    <FileTextIcon />
                  </CommandItemIcon>
                  {source.title}
                </CommandItem>
              ))}
              <CommandItem value="add-source">
                <CommandItemIcon>
                  <PlusIcon />
                </CommandItemIcon>
                Add a source…
              </CommandItem>
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
