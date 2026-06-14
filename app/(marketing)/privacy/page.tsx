const SECTIONS = [
  {
    title: "1. What we collect",
    body: `We collect information you provide directly (name, email address, password) when you create an account. We also collect content you generate using the Service, usage data (pages visited, features used, timestamps), and technical data (IP address, browser type, device identifiers). If you connect a third-party provider such as Google, we receive the profile information that provider shares.`,
  },
  {
    title: "2. How we use your information",
    body: `We use your information to: provide and improve the Service; authenticate your identity, including two-factor authentication and email verification; send transactional emails (email verification, password resets, two-factor codes, collaboration invitations, and account-change confirmations); send product updates and announcements (you can opt out at any time); detect and prevent fraud or abuse; and comply with legal obligations. We do not sell your personal data.`,
  },
  {
    title: "3. AI-generated content",
    body: `Your prompts and the content generated from them are stored to provide the Service: specifically, to populate your knowledge base, generate embeddings that power semantic search and document chat, and support history features. We do not use your content to train AI models. Your content is private to you unless you choose to share it, for example, by inviting collaborators to a workspace or document, or by enabling a public read-only link. We do not otherwise share your content with other users or third parties except where required by law.`,
  },
  {
    title: "4. Sharing your information",
    body: `We share information with: (a) service providers who help us operate the platform (hosting, email delivery, analytics) under strict data processing agreements; (b) law enforcement or government authorities when required by law; (c) a successor entity in the event of a merger, acquisition, or asset sale, with notice to you. We do not sell or rent your personal data to marketers.`,
  },
  {
    title: "5. Cookies and tracking",
    body: `We use essential cookies to maintain your session and remember your preferences. We may use analytics cookies to understand how the Service is used. You can control cookies through your browser settings. Disabling essential cookies may impair the functionality of the Service.`,
  },
  {
    title: "6. Data retention",
    body: `We retain your account information and generated content for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or regulatory reasons. Some data may persist in encrypted backups for up to 90 days.`,
  },
  {
    title: "7. Security",
    body: `We implement industry-standard technical and organizational measures to protect your data, including encryption in transit (TLS) and at rest. We support optional two-factor authentication, email verification, and session management to help keep your account secure. No method of transmission over the internet is completely secure. We will notify you promptly in the event of a data breach that affects your personal information.`,
  },
  {
    title: "8. Your rights",
    body: `Depending on where you live, you may have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; object to or restrict certain processing; receive a copy of your data in a portable format; and withdraw consent where processing is based on consent. To exercise these rights, contact us at privacy@undocx.com.`,
  },
  {
    title: "9. Children's privacy",
    body: `Undocx is not directed at children under 16. We do not knowingly collect personal data from children under 16. If we learn that we have collected such data, we will delete it promptly. If you believe a child has provided us with their information, please contact us immediately.`,
  },
  {
    title: "10. Third-party links",
    body: `The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information.`,
  },
  {
    title: "11. Changes to this policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a notice in the Service at least 14 days before the change takes effect. Your continued use of the Service after changes take effect constitutes acceptance of the revised policy.`,
  },
]

export const metadata = {
  title: "Privacy Policy",
  description: "How Undocx collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Effective date: June 1, 2025
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <p className="leading-relaxed text-muted-foreground">
            This Privacy Policy explains how Undocx collects, uses, and
            protects your information when you use our platform. We take privacy
            seriously and are committed to being transparent about our
            practices.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-base font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </div>
          ))}

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Questions about this policy? Contact us at{" "}
              <a
                href="mailto:privacy@undocx.com"
                className="text-foreground underline underline-offset-4"
              >
                privacy@undocx.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
