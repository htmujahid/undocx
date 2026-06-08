import { createFileRoute, redirect } from "@tanstack/react-router"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { z } from "zod"

const searchSchema = z.object({
  token: z.string().catch(""),
})

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/auth/forgot-password" })
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  return <ResetPasswordForm token={token} />
}
