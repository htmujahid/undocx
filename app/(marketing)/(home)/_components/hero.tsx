import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { EditorMock } from "../../_components/editor-mock";
import { Intro, Lede, Section, Title } from "../../_components/frame";
import { startHref } from "../../_components/links";

export function Hero() {
  return (
    <>
      <Intro id="top" label="Free to start" tagline="No card. Export anytime.">
        <div className="flex flex-col gap-6">
          <Title id="top-title">
            AI drafts it. You decide <span className="text-primary italic">every paragraph</span>.
          </Title>
          <Lede>Undocx asks what you need, proposes an outline, then writes. Rewrite one paragraph, lock another, and export when it reads like you wrote it.</Lede>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" render={<Link href={startHref} />}>
              Start writing free
            </Button>
            <Button size="lg" render={<Link href="/how-it-works" />}>
              How it works
            </Button>
          </div>
        </div>
      </Intro>
      <Section id="try" number="01" label="Try it" note="Live. Press Regenerate." title="Press Regenerate on the second paragraph." description="Only that paragraph changes. The first is locked and stays exactly as written. Switch to Brief or Outline to see the earlier stages.">
        <EditorMock />
      </Section>
    </>
  );
}
