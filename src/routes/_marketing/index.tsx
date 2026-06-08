import { createFileRoute } from "@tanstack/react-router"

import { Comparison } from "@/components/marketing/comparison"
import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Features } from "@/components/marketing/features"
import { Footer } from "@/components/marketing/footer"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Navbar } from "@/components/marketing/navbar"
import { Testimonials } from "@/components/marketing/testimonials"
import { UseCases } from "@/components/marketing/use-cases"

export const Route = createFileRoute("/_marketing/")({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-svh">
      <Navbar />
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
      <Footer />
    </div>
  )
}
