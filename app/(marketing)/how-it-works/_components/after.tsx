import Link from "next/link";
import { Section } from "../../_components/frame";

const items = [
  ["/features#section-regenerate", "Rewrite one paragraph", "An instruction changes that paragraph and nothing else. Undo in one step."],
  ["/features#locked-text", "Lock what is final", "Prices, quotes and the sentence you got right stay untouched through any rewrite."],
  ["/features#variations", "Compare variations", "Two or three versions side by side. Keep one or merge them."],
  ["/features#your-voice", "Sound like yourself", "Upload a few things you wrote and the draft takes on your voice."],
  ["/features#grounded-writing", "Check every number", "Citations point back into the files you attached."],
  ["/features#export", "Export anywhere", "Word, PDF, Markdown or Google Docs, as ordinary files."],
];

export function After({ number }: { number: string }) {
  return (
    <Section id="after" number={number} label="After the draft" note="Six links." title="Then it is yours to shape, and to send.">
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([href, title, text]) => (
          <li key={href}>
            <Link href={href} className="group flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-5 no-underline transition-colors hover:border-primary">
              <span className="font-serif text-xl leading-tight text-foreground group-hover:text-primary-deep">{title} →</span>
              <span className="text-sm leading-normal text-muted-foreground">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
