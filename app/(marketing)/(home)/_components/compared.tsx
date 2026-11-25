import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";

type Cell = "yes" | "partly" | "no";

const rows: [string, Cell, Cell, string?][] = [
  ["Asks who the reader is before writing", "no", "no"],
  ["Proposes an outline you approve first", "partly", "no", "You can ask a chat for one, then paste it back by hand."],
  ["Rewrites one paragraph and leaves the rest", "no", "partly"],
  ["Shows a diff before a change is kept", "no", "no"],
  ["Locks text the AI may not touch", "no", "no"],
  ["Variations side by side, with merge", "no", "no"],
  ["Learns your voice from your documents", "partly", "no", "A chat can be given samples each time; it does not keep them."],
  ["Citations that open the source", "partly", "no"],
  ["Exports to Word, PDF, Markdown, Google Docs", "no", "partly"],
];

function Mark({ value }: { value: Cell }) {
  if (value === "yes") return <CheckIcon className="size-4 text-primary" />;
  if (value === "partly") return <span className="text-sm text-muted-foreground">Partly</span>;
  return <span className="text-sm text-faint-foreground">—</span>;
}

export function Compared({ number }: { number: string }) {
  return (
    <Section id="compared" number={number} label="Compared" note="Three ways to write with AI." title="What a chat box cannot give you is a place to say no." description="A chat assistant writes well and forgets everything. AI inside a word processor edits in place and shows no diff.">
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Capabilities compared across three ways of writing with AI</caption>
          <thead>
            <tr className="border-b border-input">
              <th scope="col" className="py-3 pr-4 font-medium text-muted-foreground">
                Capability
              </th>
              <th scope="col" className="py-3 pr-4 font-medium text-muted-foreground">
                A chat assistant
              </th>
              <th scope="col" className="py-3 pr-4 font-medium text-muted-foreground">
                AI in a word processor
              </th>
              <th scope="col" className="bg-primary/5 px-3 py-3 font-serif text-base font-medium text-foreground">
                Undocx
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([capability, chat, wp, note]) => (
              <tr key={capability} className="border-b border-border align-top">
                <th scope="row" className="py-3 pr-4 font-normal text-foreground">
                  {capability}
                  {note ? <span className="block text-xs text-muted-foreground">{note}</span> : null}
                </th>
                <td className="py-3 pr-4">
                  <Mark value={chat} />
                </td>
                <td className="py-3 pr-4">
                  <Mark value={wp} />
                </td>
                <td className="bg-primary/5 px-3 py-3">
                  <Mark value="yes" />
                  <span className="sr-only">Yes</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
