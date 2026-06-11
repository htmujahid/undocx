import { headers } from "next/headers"

import { DeleteAccountForm } from "@/components/account/delete-account-form"
import { EmailForm } from "@/components/account/email-form"
import { LinkedAccountsForm } from "@/components/account/linked-accounts-form"
import { PasswordForm } from "@/components/account/password-form"
import { auth, getSession } from "@/lib/auth"

export async function setPassword(newPassword: string) {
  "use server"
  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  })
}

export default async function Page() {
  const [session, accounts] = await Promise.all([
    getSession(),
    auth.api.listUserAccounts({ headers: await headers() }),
  ])

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
      <PasswordForm hasCredential={hasCredential} />
      <EmailForm currentEmail={session!.user.email} />
      <DeleteAccountForm />
    </div>
  )
}
