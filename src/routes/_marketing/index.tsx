import { createFileRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Comparison } from "@/components/marketing/comparison"
import { Features } from "@/components/marketing/features"
import { UseCases } from "@/components/marketing/use-cases"
import { Testimonials } from "@/components/marketing/testimonials"
import { FAQ } from "@/components/marketing/faq"
import { CTA } from "@/components/marketing/cta"
import { Footer } from "@/components/marketing/footer"

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
