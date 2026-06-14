import { BlockShowcase } from "@/components/marketing/block-showcase"
import { Collaboration } from "@/components/marketing/collaboration"
import { Comparison } from "@/components/marketing/comparison"
import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Features } from "@/components/marketing/features"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Security } from "@/components/marketing/security"
import { UseCases } from "@/components/marketing/use-cases"

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Comparison />
      <Features />
      <BlockShowcase />
      <UseCases />
      <Collaboration />
      <Security />
      <FAQ />
      <CTA />
    </main>
  )
}
