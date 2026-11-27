import type { SeedBlock } from "~@/editor/server/serialize";

const p = (text: string): SeedBlock => ({ type: "paragraph", runs: [{ text }] });
const cited = (text: string, source: string, rest: string): SeedBlock => ({ type: "paragraph", runs: [{ text, cite: source }, { text: rest }] });
const h2 = (text: string): SeedBlock => ({ type: "heading", tag: "h2", text });
const h3 = (text: string): SeedBlock => ({ type: "heading", tag: "h3", text });
const bullets = (...items: string[]): SeedBlock => ({ type: "list", listType: "bullet", items: items.map((text) => ({ text })) });

export const proposalBlocks: SeedBlock[] = [
  p("Prepared for Ruth Marlow, Marlow & Finch Booksellers. Prepared by Studio Ashby. 12 March 2026."),
  { type: "rule" },
  h2("Summary"),
  p("The shop on Bridge Street is easy to buy from. The website is not. This proposal closes that gap in twelve weeks: a shorter checkout, a catalogue built around search, and order emails that sound like the shop."),
  p("The price is £18,400, fixed, in two payments. Work starts the week you sign and the new store goes live on 15 May. Everything else in these four pages explains how we got to those numbers."),
  h2("What we heard"),
  cited("Marlow & Finch has sold books on Bridge Street since 1987. Last year, 41% of orders came through the website, up from 12% in 2019", "s1", ", and the site has not changed since then."),
  cited("A customer who has found the right book still has six screens to get through before paying, and about one in three gives up on the way", "s2", ". We will cut the checkout to two steps, allow guest purchases, and track where people leave from the first day."),
  p("Alongside the checkout, we will move the catalogue to a search-first layout, so a customer who knows the title finds it in one step, and one who does not can browse by shelf as they would in the shop."),
  cited("Staff estimate that one in five phone orders is a customer who gave up online", "s3", ". Priya, who runs the Saturday till, put it more plainly than we could; her words are in the next section."),
  h2("Scope of work"),
  p("Three pieces of work, in the order customers meet them. Each has a definition of done that Ruth can check without asking us."),
  { type: "paragraph", runs: [{ text: "Checkout. ", format: ["bold"] }, { text: "We will replace the six-step checkout with a two-step flow: one screen for delivery and one for payment. Guest checkout by default, with an account offered after the order rather than before it. Saved addresses for returning customers." }] },
  { type: "paragraph", runs: [{ text: "Catalogue. ", format: ["bold"] }, { text: "Search first, with the box at the top of every page. Results show cover, price and whether the copy is on the shelf today. Browsing by shelf mirrors the shop’s own sections, starting with the " }, { text: "staff picks table by the door", note: "n1" }, { text: "." }] },
  { type: "paragraph", runs: [{ text: "Order emails. ", format: ["bold"] }, { text: "Today’s confirmation email comes from the payment provider and never names the shop. We will write and design three emails: order confirmed, order posted, and order ready to collect. Drafts by 24 April; live with the checkout on 15 May." }] },
  p("Out of scope, so there is no doubt later:"),
  { type: "list", listType: "bullet", items: [{ text: "Stock management and the till. We will document how they connect to the new site so a later project can change them." }, { text: "A loyalty scheme. Worth doing, but not before the checkout works." }] },
  { type: "quote", text: "“People ring because the website made them feel stupid, and nobody should feel stupid buying a book.” Priya, Saturday till." },
  h2("Timeline"),
  p("Twelve weeks with three checkpoints. Each checkpoint is a working version you can click through, not a slide deck."),
  { type: "table", header: ["Week", "Checkpoint", "You see"], rows: [["4", "Checkout", "A two-step checkout taking test payments."], ["8", "Catalogue", "Search and shelves with your real stock."], ["12", "Launch", "The new store live on your domain, emails included."]] },
  h2("Investment"),
  p("The total is £18,400, fixed. Half is due on signing and half on launch. The price includes twelve weeks of work and a month of fixes after launch, and it will not change unless the scope does."),
  p("Hosting stays separate: about £30 a month, paid to the provider, as now."),
  {
    type: "layout",
    columns: [
      [h3("Included"), bullets("Two-step checkout with guest purchase", "Search-first catalogue and shelf browsing", "Three order emails, written and designed", "A month of fixes after launch")],
      [h3("Not included"), bullets("Stock management and the till", "A loyalty scheme", "Photography of new stock", "Ongoing hosting, paid to the provider")],
    ],
  },
  p("Anything added later is quoted on its own."),
  h2("Next steps"),
  p("If this reads right, reply with a yes and we will send the agreement the same day. Work starts the Monday after the first payment lands."),
  { type: "list", listType: "check", items: [{ text: "Reply with a yes", checked: true }, { text: "Sign the agreement" }, { text: "First payment" }, { text: "Kick-off on Bridge Street, week one" }] },
  p("If something reads wrong, tell us which paragraph. Most of what is here came from your own staff, so it should be a short conversation."),
  { type: "rule" },
  { type: "paragraph", runs: [{ text: "Prepared with care for Marlow & Finch.", format: ["italic"] }], align: "center" },
  { type: "paragraph", runs: [{ text: "Studio Ashby · Bridge Street · March 2026" }], align: "right" },
];
