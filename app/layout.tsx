import { Inter } from "next/font/google"

import { getSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Renderical",
  description:
    "Renderical is an intelligent content generation and knowledge management platform that adapts its response layout to the nature of your content.",
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
