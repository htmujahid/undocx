import { createFileRoute } from "@tanstack/react-router"

import { ShieldCheckIcon } from "lucide-react"

export const Route = createFileRoute("/account/mfa")({
  component: MfaPage,
})

function MfaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Multi-factor auth</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>

      <div className="border-t pt-8">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <ShieldCheckIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Coming soon
            </span>
            <p className="mt-4 text-sm font-medium">Two-factor authentication</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Protect your account with an authenticator app or SMS verification.
              We're working on this feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
