import type { Metadata } from "next";
import { Clause, LegalIntro } from "../_components/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Undocx stores, what it does with your documents and sources, and what it never does.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalIntro label="Privacy" updated="25 November 2026" title="What we keep, and what we never do with it.">
        Short, in plain words. A draft until it has been reviewed by counsel.
      </LegalIntro>
      <Clause number="01" title="What we store">
        <p>Your account email, the documents you write, the briefs and outlines behind them, the writing samples you upload, and the files and links you attach as sources.</p>
        <p>Usage events needed to run and improve the service, such as which features were used and when. These are not tied to the content of your documents.</p>
      </Clause>
      <Clause number="02" title="What we do with your documents">
        <p>Your documents, samples and sources are used only to produce the text you asked for, and only for that request.</p>
        <p>They are not used to train models.</p>
      </Clause>
      <Clause number="03" title="Deletion">
        <p>Delete a document and its brief, outline, sources, notes and history are deleted with it. Delete your account and everything goes. Deleted data is removed from backups within 30 days.</p>
      </Clause>
      <Clause number="04" title="Contact">
        <p>Questions about this policy go to hello@undocx.app.</p>
      </Clause>
    </>
  );
}
