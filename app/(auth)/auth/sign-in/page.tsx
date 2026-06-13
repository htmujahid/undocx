import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata = {
  title: "Sign in",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  return <SignInForm redirectTo={redirect} />
}
