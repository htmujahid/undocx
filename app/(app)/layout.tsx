import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")
  return <>{children}</>
}
