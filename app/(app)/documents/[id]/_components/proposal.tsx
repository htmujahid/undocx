import { RewriteReview } from "./margin";
import { Cite, DocumentFrame, Para, SectionHeading, SelectionBubble, TypingPrompt } from "./sheet";

export const proposal = {
  title: "Proposal: a new online store for Marlow & Finch",
  outline: [
    ["1", "Summary"],
    ["2", "What we heard"],
    ["3", "Scope of work"],
    ["4", "Timeline"],
    ["5", "Investment"],
    ["6", "Next steps"],
  ],
  locked: ["2", "5"],
  sources: ["Sales export 2025.xlsx", "Shopify analytics, Jan to Dec 2025", "Staff interview notes.docx"],
  brief: [
    ["Reader", "Ruth Marlow and her bookkeeper"],
    ["Goal", "A yes to a twelve-week rebuild"],
    ["Tone", "Direct and warm"],
    ["Length", "Four pages"],
  ],
  status: "1,090 of 1,200 words · 2 locked passages · 3 sources",
} as const;

export const proposalNotes = [
  { id: "n1", where: "§2 ¶3", href: "#s2", when: "Yesterday", text: "Check with Ruth whether the staff picks table is staying by the door after the refit." },
];

export function ProposalDocument({ title = proposal.title }: { title?: string }) {
  return (
    <DocumentFrame status={<span>{proposal.status}</span>}>
      <header className="mb-12">
            <h1 className="m-0 font-serif text-4xl leading-tight font-medium tracking-tight text-foreground">{title}</h1>
            <p className="m-0 mt-4 text-doc text-foreground">
              Prepared for Ruth Marlow, Marlow &amp; Finch Booksellers. Prepared by Studio Ashby. 12 March 2026.
            </p>
            <hr className="mt-8 border-0 border-t border-border" />
          </header>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="1">
              Summary
            </SectionHeading>
            <Para>The shop on Bridge Street is easy to buy from. The website is not. This proposal closes that gap in twelve weeks: a shorter checkout, a catalogue built around search, and order emails that sound like the shop.</Para>
            <Para>
              The price is £18,400, fixed, in two payments. Work starts the week you sign and the new store goes live on 15 May. Everything else in these four pages explains how we got to those numbers.
            </Para>
          </section>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="2">
              What we heard
            </SectionHeading>
            <Para isLocked>
              Marlow &amp; Finch has sold books on Bridge Street since 1987. Last year, 41% of orders came through the website
              <Cite n={1} />, up from 12% in 2019, and the site has not changed since then.
            </Para>
            <RewriteReview
              instruction="Lead with the customer, not the checkout"
              before="The current checkout takes six steps and loses roughly a third of customers between the basket and payment. We propose rebuilding it as a two-step flow, with guest checkout and saved addresses, and measuring the drop-off at each step from launch."
              after="A customer who has found the right book still has six screens to get through before paying, and about one in three gives up on the way. We will cut the checkout to two steps, allow guest purchases, and track where people leave from the first day."
            />
            <Para noteId="n1">
              Alongside the checkout, we will move the catalogue to a{" "}
              <span className="relative">
                <SelectionBubble />
                <mark className="rounded-sm bg-primary/20 text-foreground">search-first layout</mark>
              </span>
              , so a customer who knows the title finds it in one step, and one who does not can browse by shelf as they would in the shop.
            </Para>
            <Para>
              Staff estimate that one in five phone orders is a customer who gave up online
              <Cite n={3} />. Priya, who runs the Saturday till, put it more plainly than we could; her words are in the next section.
            </Para>
          </section>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="3">
              Scope of work
            </SectionHeading>
            <Para>Three pieces of work, in the order customers meet them. Each has a definition of done that Ruth can check without asking us.</Para>
            <Para>
              <strong>Checkout.</strong> We will replace the six-step checkout with a two-step flow: one screen for delivery and one for payment. Guest checkout by default, with an account offered after the order rather than before it. Saved addresses for returning customers.
            </Para>
            <Para>
              <strong>Catalogue.</strong> Search first, with the box at the top of every page. Results show cover, price and whether the copy is on the shelf today. Browsing by shelf mirrors the shop&rsquo;s own sections, starting with the staff picks table by the door.
            </Para>
            <Para>
              <strong>Order emails.</strong> Today&rsquo;s confirmation email comes from the payment provider and never names the shop. We will write and design three emails: order confirmed, order posted, and order ready to collect. Drafts by 24 April; live with the checkout on 15 May.
            </Para>
            <p className="m-0 text-doc text-foreground">Out of scope, so there is no doubt later:</p>
            <ul className="m-0 grid list-disc gap-1.5 pl-6 text-doc text-foreground marker:text-primary">
              <li>Stock management and the till. We will document how they connect to the new site so a later project can change them.</li>
              <li>A loyalty scheme. Worth doing, but not before the checkout works.</li>
            </ul>
            <blockquote className="m-0 border-l-2 border-input pl-4 text-doc text-foreground italic">
              &ldquo;People ring because the website made them feel stupid, and nobody should feel stupid buying a book.&rdquo; Priya, Saturday till.
            </blockquote>
          </section>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="4">
              Timeline
            </SectionHeading>
            <Para>Twelve weeks with three checkpoints. Each checkpoint is a working version you can click through, not a slide deck.</Para>
            <table className="w-full border-collapse text-sm" contentEditable={false}>
              <thead>
                <tr className="border-b border-input text-left">
                  <th scope="col" className="py-2 pr-4 font-medium text-foreground">
                    Week
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium text-foreground">
                    Checkpoint
                  </th>
                  <th scope="col" className="py-2 font-medium text-foreground">
                    You see
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["4", "Checkout", "A two-step checkout taking test payments."],
                  ["8", "Catalogue", "Search and shelves with your real stock."],
                  ["12", "Launch", "The new store live on your domain, emails included."],
                ].map(([week, name, sees]) => (
                  <tr key={week} className="border-b border-border">
                    <td className="py-2 pr-4 tabular-nums">{week}</td>
                    <td className="py-2 pr-4 font-medium text-foreground">{name}</td>
                    <td className="py-2 text-foreground">{sees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="5">
              Investment
            </SectionHeading>
            <Para isLocked>The total is £18,400, fixed. Half is due on signing and half on launch. The price includes twelve weeks of work and a month of fixes after launch, and it will not change unless the scope does.</Para>
            <Para>Hosting stays separate: about £30 a month, paid to the provider, as now.</Para>
            <Para>Anything added later is quoted on its own.</Para>
          </section>

          <section className="grid gap-4 [&+section]:mt-14">
            <SectionHeading n="6">
              Next steps
            </SectionHeading>
            <Para>If this reads right, reply with a yes and we will send the agreement the same day. Work starts the Monday after the first payment lands.</Para>
            <ul className="m-0 grid gap-1.5 pl-1 text-doc text-foreground">
              {[
                ["Reply with a yes", true],
                ["Sign the agreement", false],
                ["First payment", false],
                ["Kick-off on Bridge Street, week one", false],
              ].map(([label, done]) => (
                <li key={label as string} className="flex items-baseline gap-2">
                  <span aria-hidden="true" className={"inline-flex size-4 shrink-0 translate-y-0.5 items-center justify-center rounded-sm border " + (done ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card")} contentEditable={false}>
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "line-through decoration-1" : undefined}>{label}</span>
                </li>
              ))}
            </ul>
            <Para>If something reads wrong, tell us which paragraph. Most of what is here came from your own staff, so it should be a short conversation.</Para>
            <TypingPrompt />
          </section>
    </DocumentFrame>
  );
}
