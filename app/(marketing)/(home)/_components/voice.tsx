import { UploadIcon } from "~@/components/ui/icons";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const generic = "In today's fast-paced digital landscape, Marlow & Finch requires a robust, user-centric e-commerce solution that leverages modern best practices to deliver a seamless experience and drive sustainable growth.";
const flagged = new Set(["fast-paced", "robust,", "user-centric", "leverages", "seamless", "sustainable"]);

export function Voice({ number }: { number: string }) {
  return (
    <Section
      id="voice"
      number={number}
      label="Your voice"
      note="With and without samples."
      title="Upload three things you wrote. The fourth sounds like them."
      description={
        <>
          The same brief, drafted with and without your samples. <MoreLink href="/features#your-voice">How voice works</MoreLink>
        </>
      }
      tone="muted"
    >
      <div role="group" aria-labelledby="voice-title" className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <Sheet className="flex flex-col">
          <SheetChrome title="Without samples" />
          <SheetPage className="grow text-base">
            <p className="m-0 text-muted-foreground">
              {generic.split(" ").map((word, index) => (
                <span key={index}>
                  {flagged.has(word) ? <span className="underline decoration-input decoration-wavy underline-offset-[0.2em]">{word}</span> : word}{" "}
                </span>
              ))}
            </p>
          </SheetPage>
        </Sheet>
        <Sheet className="flex flex-col border-primary">
          <SheetChrome title="In your voice" />
          <SheetPage className="grow text-base">
            <p className="m-0">Your customers already know what they want to read. The website should get out of their way: find the book, pay, done. Everything in this proposal serves that one sentence.</p>
            <ul aria-label="Writing samples used" className="m-0 mt-4 flex list-none flex-col gap-1 border-t border-border p-0 pt-3 text-sm text-muted-foreground">
              {["Proposal, Fenwick Gallery (2025)", "Studio newsletter, March", "Case study, Oakdene Garden Centre"].map((sample) => (
                <li key={sample} className="flex items-center gap-2">
                  <UploadIcon className="size-3" />
                  {sample}
                </li>
              ))}
            </ul>
          </SheetPage>
        </Sheet>
      </div>
    </Section>
  );
}
