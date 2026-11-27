import { Section } from "../../_components/frame";
import { WriterProfilePlayground } from "./writer-profile-playground";

const facts = [
  ["Reusable", "Make one per role, client or publication."],
  ["Optional", "A document links to one profile, or none."],
  ["Not your voice", "Profile is what you know. Voice is how you sound. Rules are what must hold."],
];

export function WriterProfile({ number }: { number: string }) {
  return (
    <Section id="writer-profile" number={number} label="Writer profile" note="Try it." title="Tell it who is writing once, not every time." description="A profile holds who you are, who you write for and the facts to rely on. Pick one and Undocx stops asking what it already knows.">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="writer-profile-title" className="m-0 min-w-0">
          <WriterProfilePlayground />
        </figure>
        <ul className="m-0 grid list-none gap-5 p-0 lg:border-l lg:border-border lg:pl-6">
          {facts.map(([term, text]) => (
            <li key={term}>
              <p className="m-0 text-sm font-medium text-foreground">{term}</p>
              <p className="m-0 mt-0.5 text-sm leading-normal text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
