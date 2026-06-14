import type { Metadata } from "next"

import { Inter } from "next/font/google"

import { getSession } from "@/lib/auth"
import { siteUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const description =
  "Undocx is an intelligent content generation and knowledge management platform that adapts its response layout to the nature of your content."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Undocx",
    template: "%s · Undocx",
  },
  description,
  applicationName: "Undocx",
  openGraph: {
    title: "Undocx",
    description,
    url: siteUrl,
    siteName: "Undocx",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Undocx",
    description,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans", inter.variable)}
    >
      <body>
        <Providers initialSession={session}>{children}</Providers>
      </body>
    </html>
  )
}
