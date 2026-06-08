import { createFileRoute } from "@tanstack/react-router"

import { useQuery } from "@tanstack/react-query"

import { DeleteAccountForm } from "@/components/account/delete-account-form"
import { EmailForm } from "@/components/account/email-form"
import { LinkedAccountsForm } from "@/components/account/linked-accounts-form"
import { PasswordForm } from "@/components/account/password-form"
import { listAccountsQueryOptions } from "@/lib/queries/accounts"

export const Route = createFileRoute("/account/security")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listAccountsQueryOptions),
  component: SecurityPage,
})

function SecurityPage() {
  const { data: accounts = [] } = useQuery(listAccountsQueryOptions)
  const hasCredential = accounts.some((a) => a.providerId === "credential")

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-lg font-semibold">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email address, password, and account security.
        </p>
      </div>

      <LinkedAccountsForm accounts={accounts} />
      <EmailForm />
      <PasswordForm hasCredential={hasCredential} />
      <DeleteAccountForm />
    </div>
  )
}
