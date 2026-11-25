import { Section } from "../../_components/frame";

const cases = [
  { name: "Proposals", who: "Freelancers and studios who pitch every week", lead: "The brief fixes the ask and the price. The outline puts them where the client reads first.", locked: "The price, the payment terms, the quote from the client's own staff." },
  { name: "Reports", who: "Consultants reporting to clients or boards", lead: "Long, sourced, and read by people who skip to the numbers. The outline keeps it one document.", locked: "The method section, agreed with the client before the work started." },
  { name: "Articles", who: "Writers and marketers with a publication and a deadline", lead: "Voice matters most here. Three past pieces teach it; the brief sets the word limit.", locked: "The opening paragraph, written by hand." },
];

export function UseCases({ number }: { number: string }) {
  return (
    <Section id="who-its-for" number={number} label="Who it is for" note="Three kinds of writer." title="People who write the same kind of document every week." description="The brief changes with the document. The control does not.">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
        {cases.map((item) => (
          <article key={item.name} className="flex flex-col gap-3 border-t-2 border-primary pt-4">
            <h3 className="m-0 font-serif text-3xl leading-none font-medium text-foreground">{item.name}</h3>
            <p className="m-0 text-sm text-muted-foreground">{item.who}</p>
            <p className="m-0 text-base leading-normal text-foreground">{item.lead}</p>
            <p className="m-0 mt-auto border-t border-border pt-3 text-sm leading-normal text-muted-foreground">
              <span className="font-medium text-foreground">Usually locked: </span>
              {item.locked}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
