import type { Metadata } from "next";
import { Clause, LegalIntro } from "../_components/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Undocx.",
};

export default function TermsPage() {
  return (
    <>
      <LegalIntro label="Terms" updated="28 November 2026" title="Short terms, in plain words.">
        A draft until it has been reviewed by counsel.
      </LegalIntro>
      <Clause number="01" title="Plans and payment">
        <p>Free costs nothing. It includes a monthly allowance of AI writing that resets on the first day of each month (UTC), and the limits shown on the pricing page. Pro is billed monthly at the price shown on the pricing page, with a larger allowance and higher limits, and you can cancel at any time. We will give notice before any price changes or changes to plan limits.</p>
        <p>Payments for Pro are processed by Polar, which acts as the seller. Your subscription stays active until the end of the period you paid for. When it ends you go back to Free: nothing is deleted, but the Free limits apply to anything new you add.</p>
      </Clause>
      <Clause number="02" title="Your content">
        <p>You own what you write, what you upload, and what Undocx drafts for you, including the folders and tags you use to organise your documents. You are responsible for having the right to use the sources you attach.</p>
        <p>You can export every document at any time as Word, OpenDocument, PDF, Markdown, HTML or JSON, and the exported files do not depend on Undocx.</p>
      </Clause>
      <Clause number="03" title="Your account">
        <p>You sign in with Google. You can delete your account at any time from the Account page, which deletes your data as described in the privacy policy. Cancel an active Pro subscription first.</p>
      </Clause>
      <Clause number="04" title="Acceptable use">
        <p>Do not use Undocx to produce content that is unlawful or that misrepresents its authorship where disclosure is required.</p>
      </Clause>
      <Clause number="05" title="Liability">
        <p>Drafts and answers can contain errors or miss something in your documents. Check them before you rely on them, especially numbers and quotations. The service is provided as is.</p>
      </Clause>
    </>
  );
}
