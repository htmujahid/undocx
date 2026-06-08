import { createFileRoute } from "@tanstack/react-router"

import { Comparison } from "@/components/marketing/comparison"
import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Features } from "@/components/marketing/features"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Testimonials } from "@/components/marketing/testimonials"
import { UseCases } from "@/components/marketing/use-cases"

export const Route = createFileRoute("/_marketing/")({ component: LandingPage })

function LandingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Comparison />
      <Features />
      <UseCases />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
  )
}
