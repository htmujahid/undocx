import { FaqList } from "../../_components/faq-list";
import { Section } from "../../_components/frame";

const items = [
  { question: "What if I only want to change one sentence?", answer: "Select it and give an instruction. Only that sentence is rewritten, shown as a diff until you keep it. The paragraph around it does not move." },
  { question: "Can I stop the AI from touching parts I have already got right?", answer: "Yes. Lock a sentence, a paragraph or a section. Every later rewrite works around it, and the editor tells you how many locked passages it skipped." },
  { question: "Will it sound like me or like every other AI draft?", answer: "Upload three to ten documents you are happy with and the draft takes on their sentence length, openings and vocabulary. A writer profile says who you are and who you write for, and rules fix things like British spelling. All three are separate, optional picks." },
  { question: "Where do the numbers in the draft come from?", answer: "From the files and links you attach. Each figure carries a citation that opens the source at the row or paragraph it came from. A number with no source behind it is flagged so you can attach one or cut it." },
  { question: "Do I have to answer its questions or accept its outline?", answer: "No. Questions come one at a time, made for what you asked, and you can skip any of them or press Just write it. The outline appears only when the document needs one, and you can change it or turn it off before anything is written." },
];

export function Faq({ number }: { number: string }) {
  return (
    <Section id="faq" number={number} label="Questions" note="Five, about the product." title="The things people ask before they trust it with a client's proposal." description="Plain answers about how the editor behaves. Plan and data questions are on the pricing and privacy pages.">
      <FaqList items={items} defaultOpen={items[0].question} />
    </Section>
  );
}
