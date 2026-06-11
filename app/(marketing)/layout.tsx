import { Footer } from "@/components/marketing/footer"
import { Navbar } from "@/components/marketing/navbar"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
