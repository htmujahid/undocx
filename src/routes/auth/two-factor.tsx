import { createFileRoute } from "@tanstack/react-router"

import { TwoFactorForm } from "@/components/auth/two-factor-form"

export const Route = createFileRoute("/auth/two-factor")({
  component: TwoFactorPage,
})

function TwoFactorPage() {
  return <TwoFactorForm />
}
