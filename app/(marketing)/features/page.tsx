import type { Metadata } from "next";
import { Cta } from "../_components/cta";
import { Intro, Lede, Title } from "../_components/frame";
import { Brief } from "./_components/brief";
import { ClaimsCheck } from "./_components/claims-check";
import { CommandPalette } from "./_components/command-palette";
import { DocumentTypes } from "./_components/document-types";
import { Export } from "./_components/export";
import { GroundedWriting } from "./_components/grounded-writing";
import { HouseRules } from "./_components/house-rules";
import { LockedText } from "./_components/locked-text";
import { Notes } from "./_components/notes";
import { OnePage } from "./_components/one-page";
import { PageSetup } from "./_components/page-setup";
import { RichText } from "./_components/rich-text";
import { Outline } from "./_components/outline";
import { ReviewAndShare } from "./_components/review-and-share";
import { SectionRegenerate } from "./_components/section-regenerate";
import { SelectionToolbar } from "./_components/selection-toolbar";
import { Variations } from "./_components/variations";
import { WriterProfile } from "./_components/writer-profile";
import { YourVoice } from "./_components/your-voice";

export const metadata: Metadata = {
  title: "Features",
  description: "Brief first, outline when it helps, section regenerate, locked text, variations, notes to self, command palette, one page, writer profile, your voice, grounded writing, export, house rules, review, claims check, document types, rich text, the selection toolbar and page setup.",
};

const index = [
  ["01", "Brief first", "brief"],
  ["02", "Outline when it helps", "outline"],
  ["03", "Section regenerate", "section-regenerate"],
  ["04", "Locked text", "locked-text"],
  ["05", "Variations", "variations"],
  ["06", "Notes to self", "notes"],
  ["07", "Command palette", "command-palette"],
  ["08", "One page", "one-page"],
  ["09", "Writer profile", "writer-profile"],
  ["10", "Your voice", "your-voice"],
  ["11", "Grounded writing", "grounded-writing"],
  ["12", "Export", "export"],
  ["13", "House rules", "house-rules"],
  ["14", "Review and share", "review-and-share"],
  ["15", "Claims check", "claims-check"],
  ["16", "Document types", "document-types"],
  ["17", "Rich text", "rich-text"],
  ["18", "Selection toolbar", "selection-toolbar"],
  ["19", "Page setup", "page-setup"],
] as const;

export default function FeaturesPage() {
  return (
    <>
      <Intro label="Features" tagline="Nineteen, on every document.">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <Title>
              Nineteen ways to steer a draft <span className="text-primary italic">without rewriting it</span>.
            </Title>
            <Lede>Every feature here answers the same complaint: AI writers give you text, not control. Each is shown on a real document, a web designer&rsquo;s proposal to a bookshop, and most of them work right here on the page.</Lede>
          </div>
          <nav aria-label="On this page">
            <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 text-sm sm:grid-cols-3 lg:grid-cols-5">
              {index.map(([number, name, slug]) => (
                <li key={slug}>
                  <a href={`#${slug}`} className="group flex h-full flex-col justify-between gap-4 rounded-md border border-border bg-card p-3 no-underline transition-colors hover:border-primary">
                    <span className="font-mono text-[0.65rem] tracking-[0.15em] text-primary">{number}</span>
                    <span className="leading-tight text-foreground group-hover:text-primary-deep">{name}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </Intro>

      <Brief number="01" />
      <Outline number="02" />
      <SectionRegenerate number="03" />
      <LockedText number="04" />
      <Variations number="05" />
      <Notes number="06" />
      <CommandPalette number="07" />
      <OnePage number="08" />
      <WriterProfile number="09" />
      <YourVoice number="10" />
      <GroundedWriting number="11" />
      <Export number="12" />
      <HouseRules number="13" />
      <ReviewAndShare number="14" />
      <ClaimsCheck number="15" />
      <DocumentTypes number="16" />
      <RichText number="17" />
      <SelectionToolbar number="18" />
      <PageSetup number="19" />

      <Cta title={<>Nineteen features. One rule: <span className="text-primary italic">you decide</span>.</>} />
    </>
  );
}
