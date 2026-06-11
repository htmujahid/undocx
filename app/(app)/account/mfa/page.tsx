import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react"

import { MfaEnableForm } from "@/components/account/mfa-enable-form"
import { MfaManageForm } from "@/components/account/mfa-manage-form"
import { getSession } from "@/lib/auth"

export default async function MfaPage() {
  const session = await getSession()
  const isEnabled = !!session?.user.twoFactorEnabled

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Multi-factor authentication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an extra layer of security to your account with an authenticator
          app.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border p-4">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}
        >
          {isEnabled ? (
            <ShieldCheckIcon className="size-5 text-green-600 dark:text-green-400" />
          ) : (
            <ShieldOffIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {isEnabled ? "2FA is enabled" : "2FA is not enabled"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isEnabled
              ? "Your account is protected with a second factor."
              : "Enable 2FA to protect your account with an authenticator app."}
          </p>
        </div>
      </div>

      {isEnabled ? <MfaManageForm /> : <MfaEnableForm />}
    </div>
  )
}
