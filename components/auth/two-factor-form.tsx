"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { TotpForm } from "./totp-form"
import { OtpForm } from "./otp-form"

type Mode = "totp" | "otp"

export function TwoFactorForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("totp")

  function onSuccess() {
    router.push("/workspace")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Two-factor verification
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "totp"
            ? "Enter the code from your authenticator app, or use a backup code."
            : "We'll send a one-time code to your email address."}
        </p>
      </div>

      {mode === "totp" ? (
        <TotpForm onSuccess={onSuccess} onSwitchToOtp={() => setMode("otp")} />
      ) : (
        <OtpForm onSuccess={onSuccess} onSwitchToTotp={() => setMode("totp")} />
      )}
    </div>
  )
}
