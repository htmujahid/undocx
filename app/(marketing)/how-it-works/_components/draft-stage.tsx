import { EditorMock } from "../../_components/editor-mock";
import { Section } from "../../_components/frame";

export function DraftStage({ number }: { number: string }) {
  return (
    <Section id="draft" number={number} label="Draft" note="The live editor." title="The draft is where you take over, one paragraph at a time." description="Rewrite with an instruction, lock as final, or open variations. The rest of the document never moves. This is the real editor; try it.">
      <EditorMock />
    </Section>
  );
}
