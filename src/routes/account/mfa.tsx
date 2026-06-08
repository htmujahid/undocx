import { createFileRoute } from "@tanstack/react-router"

import { MfaForm } from "@/components/account/mfa-form"

export const Route = createFileRoute("/account/mfa")({
  component: MfaPage,
})

function MfaPage() {
  return <MfaForm />
}
