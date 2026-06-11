"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  CreditCardIcon,
  KeyRoundIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"

import { Navbar } from "@/components/marketing/navbar"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/account", label: "Profile", icon: UserIcon, soon: false },
  { to: "/account/security", label: "Security", icon: ShieldIcon, soon: false },
  {
    to: "/account/subscription",
    label: "Subscription",
    icon: CreditCardIcon,
    soon: true,
  },
  { to: "/account/mfa", label: "MFA", icon: KeyRoundIcon, soon: false },
] as const

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  function isActive(to: string) {
    if (to === "/account")
      return pathname === "/account" || pathname === "/account/"
    return pathname.startsWith(to)
  }

  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
          <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-52 lg:flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.to)
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
                {item.soon && (
                  <span className="ml-auto hidden rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <main className="max-w-lg min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
