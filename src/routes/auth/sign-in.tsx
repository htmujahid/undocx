import { createFileRoute } from "@tanstack/react-router"

import { SignInForm } from "@/components/auth/sign-in-form"

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
})

function SignInPage() {
  return <SignInForm />
}
