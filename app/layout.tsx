import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { getSession } from "@/lib/auth"
import { siteUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const description =
  "Renderical is an intelligent content generation and knowledge management platform that adapts its response layout to the nature of your content."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Renderical",
    template: "%s · Renderical",
  },
  description,
  applicationName: "Renderical",
  openGraph: {
    title: "Renderical",
    description,
    url: siteUrl,
    siteName: "Renderical",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Renderical",
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
