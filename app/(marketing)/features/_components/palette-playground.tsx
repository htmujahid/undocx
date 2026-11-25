"use client";

import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandItemIcon, CommandList, CommandSeparator, CommandShortcut } from "~@/components/ui/command";
import { CheckIcon, ColumnsIcon, DownloadIcon, FileTextIcon, FocusIcon, LockIcon, NoteIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { Sheet } from "../../_components/doc";

const actions = [
  { value: "regenerate", label: "Regenerate with an instruction", shortcut: "mod+r", Icon: RefreshCwIcon },
  { value: "variations", label: "Three variations", shortcut: "mod+shift+v", Icon: ColumnsIcon },
  { value: "lock", label: "Lock as final", shortcut: "mod+l", Icon: LockIcon },
  { value: "note", label: "Add a note to myself", shortcut: "mod+shift+n", Icon: NoteIcon },
];
const sections = ["Summary", "What we heard", "Scope of work", "Timeline", "Investment", "Next steps"];
const sources = ["Sales export 2025.xlsx", "Shopify analytics, Jan to Dec 2025", "Staff interview notes.docx"];
const document = [
  { value: "focus", label: "Focus mode", shortcut: "mod+shift+f", Icon: FocusIcon },
  { value: "export", label: "Export…", shortcut: "mod+e", Icon: DownloadIcon },
];

const labels: Record<string, string> = Object.fromEntries([
  ...actions.map((action) => [action.value, action.label]),
  ...sections.map((section, index) => [`go-${index + 1}`, `Go to ${index + 1}. ${section}`]),
  ...sources.map((source) => [source, `Open ${source}`]),
  ...document.map((item) => [item.value, item.label]),
]);

export function PalettePlayground() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Sheet>
      <Command filter="fuzzy" onAction={(value) => setLast(String(value))}>
        <CommandInput aria-label="Search actions, sections and sources" placeholder="Regenerate shorter, lock this, go to Investment…" />
        <CommandEmpty>Nothing by that name.</CommandEmpty>
        <CommandList className="max-h-72">
          <CommandGroup>
            <CommandGroupLabel>This paragraph</CommandGroupLabel>
            {actions.map(({ value, label, shortcut, Icon }) => (
              <CommandItem key={value} value={value} shortcut={shortcut}>
                <CommandItemIcon>
                  <Icon />
                </CommandItemIcon>
                {label}
                <CommandShortcut />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandGroupLabel>Go to</CommandGroupLabel>
            {sections.map((section, index) => (
              <CommandItem key={section} value={`go-${index + 1}`}>
                <CommandItemIcon className="font-serif text-primary">{index + 1}</CommandItemIcon>
                {section}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandGroupLabel>Sources</CommandGroupLabel>
            {sources.map((source) => (
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
            {document.map(({ value, label, shortcut, Icon }) => (
              <CommandItem key={value} value={value} shortcut={shortcut}>
                <CommandItemIcon>
                  <Icon />
                </CommandItemIcon>
                {label}
                <CommandShortcut />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <p role="status" data-slot="palette-result" className="m-0 flex h-10 items-center gap-2 border-t border-border px-4 text-sm text-muted-foreground">
        {last ? (
          <>
            <CheckIcon className="size-3 text-primary" />
            <span>
              Ran <span className="font-medium text-foreground">{labels[last] ?? last}</span>. In the editor, that happens to the paragraph at your cursor.
            </span>
          </>
        ) : (
          <span>Type to filter, arrow keys to move, Enter to run.</span>
        )}
      </p>
    </Sheet>
  );
}
