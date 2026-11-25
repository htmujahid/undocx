import { Section } from "../../_components/frame";

const steps = [
  ["9:10", "Brief", "Four questions. Ruth and her bookkeeper; a yes to a twelve-week rebuild; direct and warm; four pages. Two minutes."],
  ["9:13", "Sources", "Attach the sales export, the analytics funnel report and the staff interview notes. Undocx reads them before it writes."],
  ["9:15", "Outline", "Six sections proposed. Scope of work moved up above What we heard. Approve."],
  ["9:17", "Draft", "Six sections written in order, each with the outline and the earlier sections in view. About three minutes."],
  ["9:22", "Lock", "The price paragraph and the quote from Priya are locked. They will not move again."],
  ["9:25", "Rewrite", "Paragraph two of What we heard, with the instruction lead with the customer. Diff reviewed, kept."],
  ["9:31", "Variations", "Three openings for the Summary. B's list merged with C's first sentence."],
  ["9:36", "Check", "Every number is cited. One claim had no source; it was the writer's estimate and is now marked as one."],
  ["9:38", "Export", "Word for Ruth, who comments in Word. PDF for the bookkeeper. Twenty-eight minutes, start to send."],
];

export function Walkthrough({ number }: { number: string }) {
  return (
    <Section id="walkthrough" number={number} label="One morning" note="Twenty-eight minutes." title="The Marlow & Finch proposal, start to send." description="Nine steps. Most of the time is spent deciding, not typing." tone="muted">
      <ol className="relative m-0 grid list-none gap-0 p-0 before:absolute before:top-2 before:bottom-2 before:left-[4.6rem] before:w-px before:bg-input">
        {steps.map(([time, title, text]) => (
          <li key={time} className="grid grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] items-start gap-x-3 py-3">
            <span className="pt-1 font-mono text-sm tabular-nums text-primary">{time}</span>
            <span aria-hidden="true" className="relative top-2 mx-auto block size-2.5 rounded-full border-2 border-primary bg-background" />
            <span>
              <span className="block font-serif text-xl leading-tight text-foreground">{title}</span>
              <span className="block text-base leading-normal text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
