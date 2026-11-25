import type { Metadata } from "next";
import { Clause, LegalIntro } from "../_components/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Undocx.",
};

export default function TermsPage() {
  return (
    <>
      <LegalIntro label="Terms" updated="25 November 2026" title="Short terms, in plain words.">
        A draft until it has been reviewed by counsel.
      </LegalIntro>
      <Clause number="01" title="Plans and payment">
        <p>Free costs nothing. Pro is billed monthly at the price shown on the pricing page, and you can cancel at any time. We will give notice before any price changes.</p>
      </Clause>
      <Clause number="02" title="Your content">
        <p>You own what you write, what you upload, and what Undocx drafts for you. You are responsible for having the right to use the sources you attach.</p>
      </Clause>
      <Clause number="03" title="Acceptable use">
        <p>Do not use Undocx to produce content that is unlawful or that misrepresents its authorship where disclosure is required.</p>
      </Clause>
      <Clause number="04" title="Liability">
        <p>Drafts can contain errors. Check them before you rely on them, especially numbers and quotations. The service is provided as is.</p>
      </Clause>
    </>
  );
}
