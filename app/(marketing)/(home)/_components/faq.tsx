import { FaqList } from "../../_components/faq-list";
import { Section } from "../../_components/frame";

const items = [
  { question: "What if I only want to change one sentence?", answer: "Select it and give an instruction. Only that sentence is rewritten, shown as a diff until you keep it. The paragraph around it does not move." },
  { question: "Can I stop the AI from touching parts I have already got right?", answer: "Yes. Lock a sentence, a paragraph or a section. Every later rewrite works around it, and the editor tells you how many locked passages it skipped." },
  { question: "Will it sound like me or like every other AI draft?", answer: "Upload three to ten documents you are happy with and the draft takes on their sentence length, openings and vocabulary. Without samples it sounds like anyone; with them it sounds like you." },
  { question: "Where do the numbers in the draft come from?", answer: "From the files and links you attach. Each figure carries a citation that opens the source at the row or paragraph it came from. A number with no source behind it is flagged so you can attach one or cut it." },
  { question: "What if I do not like the outline it proposes?", answer: "Change it. Reorder, rename, cut or add sections before anything is written. The length budget rebalances as you go, and the draft only starts when you approve." },
  { question: "Can I just type, without the AI?", answer: "Yes. It is an ordinary editor. Type anywhere, format as you like, and call on the AI only for the passages you ask it to write or rewrite." },
  { question: "What do I get out at the end?", answer: "Word, PDF, Markdown or Google Docs. Locks disappear and citations become footnotes or a sources list, so the file reads normally anywhere." },
];

export function Faq({ number }: { number: string }) {
  return (
    <Section id="faq" number={number} label="Questions" note="Seven, about the product." title="The things people ask before they trust it with a client's proposal." description="Plain answers about how the editor behaves. Plan and data questions are on the pricing and privacy pages.">
      <FaqList items={items} defaultOpen={items[0].question} />
    </Section>
  );
}
