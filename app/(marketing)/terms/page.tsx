const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: `By accessing or using Undocx ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms apply to all users, including visitors, registered users, and paying subscribers.`,
  },
  {
    title: "2. Use of the service",
    body: `You must be at least 16 years old to use Undocx. You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.`,
  },
  {
    title: "3. Accounts",
    body: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at support@undocx.com if you suspect unauthorized access to your account.`,
  },
  {
    title: "4. Content you generate",
    body: `You retain ownership of the content you create using the Service. By using the Service, you grant Undocx a limited, non-exclusive license to store and process your content solely to provide the Service to you. You control how your content is shared (including inviting collaborators and enabling public read-only links) and you are responsible for what you choose to share. We do not use your content to train AI models or share it with third parties without your consent.`,
  },
  {
    title: "5. Prohibited activities",
    body: `You agree not to: (a) use the Service to generate illegal, harmful, or deceptive content; (b) attempt to reverse engineer or compromise the Service's security; (c) use automated means to access the Service in a way that exceeds reasonable use; (d) impersonate another person or entity; (e) violate any applicable local, national, or international law or regulation.`,
  },
  {
    title: "6. Intellectual property",
    body: `The Undocx name, logo, product design, and underlying technology are the intellectual property of Undocx and its licensors. These Terms do not grant you any right to use our trademarks, trade names, or branding without our prior written consent.`,
  },
  {
    title: "7. Paid subscriptions",
    body: `Undocx is currently in early access and free to use; paid plans are not yet available. When paid plans launch, they will be billed in advance on a monthly or annual basis. All charges are non-refundable except where required by law. We reserve the right to change pricing with at least 30 days' notice. If you cancel, you will retain access until the end of your current billing period.`,
  },
  {
    title: "8. Disclaimers",
    body: `The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. Undocx does not warrant that the Service will be error-free, uninterrupted, or free of harmful components. AI-generated content may be inaccurate; always verify important information independently.`,
  },
  {
    title: "9. Limitation of liability",
    body: `To the fullest extent permitted by applicable law, Undocx shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of or inability to use the Service. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "10. Termination",
    body: `We may suspend or terminate your access to the Service at any time if we believe you have violated these Terms. You may terminate your account at any time through the account settings. Upon termination, your right to use the Service ceases immediately, and we may delete your data in accordance with our Privacy Policy.`,
  },
  {
    title: "11. Governing law",
    body: `These Terms are governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except where prohibited by law.`,
  },
  {
    title: "12. Changes to these terms",
    body: `We may update these Terms from time to time. When we do, we'll update the effective date below and, for material changes, notify you by email or through the Service. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.`,
  },
]

export const metadata = {
  title: "Terms of Service",
  description: "The terms and conditions that govern your use of Undocx.",
}

export default function TermsPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Effective date: June 1, 2025
          </p>
        </div>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using Undocx.
            These Terms form a legally binding agreement between you and Undocx
            regarding your use of the platform and its services.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-semibold tracking-tight mb-3">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Questions about these Terms? Contact us at{" "}
              <a
                href="mailto:legal@undocx.com"
                className="text-foreground underline underline-offset-4"
              >
                legal@undocx.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
