import { createFileRoute } from "@tanstack/react-router"

import { SecurityForm } from "@/components/account/security-form"

export const Route = createFileRoute("/account/security")({
  component: SecurityPage,
})

function SecurityPage() {
  return <SecurityForm />
}
