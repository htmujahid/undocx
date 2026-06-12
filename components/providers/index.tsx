import type * as React from "react"

import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"

import { AuthProvider } from "./auth-provider"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"

type Session = React.ComponentProps<typeof AuthProvider>["session"]

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession?: Session
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider>
          <AuthProvider session={initialSession}>{children}</AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
