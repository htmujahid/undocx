import type { Metadata } from "next";
import { Clause, LegalIntro } from "../_components/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Undocx stores, what it does with your documents and sources, and what it never does.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalIntro label="Privacy" updated="27 November 2026" title="What we keep, and what we never do with it.">
        Short, in plain words. A draft until it has been reviewed by counsel.
      </LegalIntro>
      <Clause number="01" title="What we store">
        <p>Your name, email address and profile photo from Google when you sign in. The documents you write, the briefs and outlines behind them, their notes and saved versions, your assistant conversations, the writing samples you add, and the files, text and links you keep as sources. Uploaded files are kept in our file storage until you delete them.</p>
        <p>Records of your AI requests, such as which feature was used, when, and how many tokens it took. They do not contain the text of your documents.</p>
      </Clause>
      <Clause number="02" title="What we do with your documents">
        <p>Your documents, samples and sources are used only to produce the text you asked for, and only for that request. To do that, the relevant text is sent to our AI provider, OpenAI, with its option to store the request turned off. What OpenAI does with data it receives is covered by its own terms.</p>
        <p>We do not use your content to train models.</p>
      </Clause>
      <Clause number="03" title="Deletion">
        <p>Delete a document and its brief, notes, saved versions and assistant conversation are deleted with it. The sources you attached stay in your library, because other documents may use them.</p>
        <p>Delete a source and its text and uploaded file are deleted. Documents that cited it keep their text and citation numbers, but the source details are gone.</p>
        <p>Delete your account, from the Account page, and we delete straight away: your account and sign-in, every document with its notes, versions, briefs and assistant conversations, all your sources and their uploaded files, your writer profiles, voices and rule sets, and the records of your AI requests. Your files are removed from storage first. If that fails, the account is not deleted, so nothing is left behind, and you can try again. Deleting an account cannot be undone and we cannot recover anything afterwards.</p>
        <p>Deleted data is removed from backups within 30 days. Anything you exported and saved to your own devices stays with you.</p>
      </Clause>
      <Clause number="04" title="Contact">
        <p>Questions about this policy go to hello@undocx.app.</p>
      </Clause>
    </>
  );
}
