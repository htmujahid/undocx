import { Section } from "../../_components/frame";
import { VoicePlayground } from "./voice-playground";

const learns = [
  ["Sentence length", "Short where you are short."],
  ["Openings", "How you start a paragraph."],
  ["Banned words", "The ones you never use."],
];

export function YourVoice({ number }: { number: string }) {
  return (
    <Section id="your-voice" number={number} label="Your voice" note="Three samples." title="Upload three things you wrote. The fourth sounds like them." description="Switch samples on and off and read the same paragraph change register.">
      <div className="flex flex-col gap-8">
        <figure aria-labelledby="your-voice-title" className="m-0 min-w-0">
          <VoicePlayground />
        </figure>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <dl className="m-0 grid gap-0">
            <p className="m-0 mb-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">What it learns</p>
            {learns.map(([term, text]) => (
              <div key={term} className="flex items-baseline gap-2 border-t border-border py-2 text-sm">
                <dt className="m-0 font-medium whitespace-nowrap text-foreground">{term}</dt>
                <span aria-hidden="true" className="flex-1 border-b border-dotted border-input" />
                <dd className="m-0 text-right text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 max-w-measure self-end text-sm leading-normal text-muted-foreground">Three to ten documents you are happy with. They are used for your drafts only, never for anyone else&rsquo;s.</p>
        </div>
      </div>
    </Section>
  );
}
