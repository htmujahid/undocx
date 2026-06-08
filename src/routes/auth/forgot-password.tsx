import { createFileRoute } from "@tanstack/react-router"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
