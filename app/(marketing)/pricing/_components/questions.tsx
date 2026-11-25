import { FaqList } from "../../_components/faq-list";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const items = [
  { question: "What does it cost?", answer: "Free gives you five documents and a monthly allowance of AI writing. Pro is $10 a month for unlimited documents, no AI writing limit, your voice and grounded writing." },
  { question: "What happens when the Free allowance runs out?", answer: "The AI stops for the rest of the month. You can keep typing, editing and exporting; nothing is locked away." },
  { question: "Can my team use it together?", answer: "Not yet. Each document belongs to one account. A team plan with shared documents, voices and rules comes later." },
  { question: "Is my text used to train AI models?", answer: "No. Your documents, writing samples and attached sources are used only to write for you. They are not used to train models." },
];

export function Questions({ number }: { number: string }) {
  return (
    <Section id="pricing-faq" number={number} label="Questions" note="About the plans." title="About the plans." description={<MoreLink href="/#faq">Questions about the editor</MoreLink>}>
      <FaqList items={items} defaultOpen={items[0].question} />
    </Section>
  );
}
