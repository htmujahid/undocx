import { Outlet, createFileRoute } from "@tanstack/react-router"

import { Footer } from "@/components/marketing/footer"
import { Navbar } from "@/components/marketing/navbar"

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
})

function MarketingLayout() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
