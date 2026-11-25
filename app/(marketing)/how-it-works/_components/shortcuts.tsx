import { Section } from "../../_components/frame";

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, index) => (
        <kbd key={index} className="inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-input bg-card px-1.5 font-sans text-xs text-foreground shadow-[0_1px_0_var(--input)]">
          {key}
        </kbd>
      ))}
    </span>
  );
}

const groups = [
  { title: "Steering", items: [[["⌘", "R"], "Regenerate the paragraph at the cursor"], [["⌘", "⇧", "R"], "Regenerate with the last instruction"], [["⌘", "L"], "Lock or unlock the selection"], [["⌘", "⇧", "V"], "Variations for the selection"], [["⌘", "⇧", "N"], "Note to self on the selection"], [["⌘", "Z"], "Undo the last kept change"]] },
  { title: "Moving around", items: [[["⌘", "K"], "Command palette: every action by name"], [["⌘", "B"], "Show or hide the outline"], [["⌘", "J"], "Show or hide the assistant"], [["⌘", "O"], "Jump to a section from the outline"], [["⌘", "/"], "Open or close the brief"], [["⌘", "⇧", "F"], "Focus mode: just the page"], [["⌘", "E"], "Export"]] },
] as const;

export function Shortcuts({ number }: { number: string }) {
  return (
    <Section
      id="keyboard"
      number={number}
      label="Keyboard"
      note="⌘K for everything."
      title="Every decision is one shortcut."
      description={
        <>
          Press <Keys keys={["⌘", "K"]} /> and type what you want: regenerate shorter, lock this, export as PDF. Ctrl replaces ⌘ on Windows and Linux.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="m-0 mb-2 border-b border-input pb-2 font-serif text-xl font-medium text-foreground">{group.title}</h3>
            <ul className="m-0 grid list-none gap-y-0 p-0">
              {group.items.map(([keys, action]) => (
                <li key={action} className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm">
                  <span className="text-foreground">{action}</span>
                  <Keys keys={[...keys]} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
