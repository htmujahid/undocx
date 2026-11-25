import type { Metadata } from "next";
import { Cta } from "../_components/cta";
import { Intro, Lede, Title } from "../_components/frame";
import { After } from "./_components/after";
import { BriefStage } from "./_components/brief-stage";
import { DraftStage } from "./_components/draft-stage";
import { OutlineStage } from "./_components/outline-stage";
import { Shortcuts } from "./_components/shortcuts";
import { Walkthrough } from "./_components/walkthrough";

export const metadata: Metadata = {
  title: "How it works",
  description: "Brief, outline, draft. How Undocx takes one document from four questions to a finished proposal, with you approving each stage.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Intro label="How it works" tagline="Three stages.">
        <div className="flex flex-col gap-6">
          <Title>
            Brief. Outline. Draft. <span className="text-primary italic">You approve each one.</span>
          </Title>
          <Lede>Undocx never writes from a blank prompt. It asks what the document is for, proposes a structure, and only then drafts, one section at a time.</Lede>
        </div>
      </Intro>
      <BriefStage number="01" />
      <OutlineStage number="02" />
      <DraftStage number="03" />
      <Walkthrough number="04" />
      <Shortcuts number="05" />
      <After number="06" />
      <Cta title={<>Start with the brief. <span className="text-primary italic">Finish with your name on it</span>.</>} />
    </>
  );
}
