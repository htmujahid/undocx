"use client"

import { CreditCardIcon } from "lucide-react"

export function SubscriptionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and billing details.
        </p>
      </div>

      <div className="border-t pt-8">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <CreditCardIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Coming soon
            </span>
            <p className="mt-4 text-sm font-medium">Subscription management</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              View your current plan, upgrade or downgrade, and manage billing,
              all in one place. We&apos;re working on it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
