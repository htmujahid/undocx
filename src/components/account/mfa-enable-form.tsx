import { useState } from "react"

import { QRCode } from "react-qr-code"
import { toast } from "sonner"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { authUserQueryOptions } from "@/lib/queries/auth"

type EnableStep = "idle" | "setup"

export function MfaEnableForm() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [step, setStep] = useState<EnableStep>("idle")
  const [password, setPassword] = useState("")
  const [totpUri, setTotpUri] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleEnable() {
    if (!password) return
    setLoading(true)
    const { data, error } = await authClient.twoFactor.enable({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    if (data?.totpURI) {
      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes ?? [])
      setStep("setup")
    }
  }

  async function handleVerify() {
    if (verifyCode.length !== 6) return
    setLoading(true)
    const { data, error } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      setVerifyCode("")
      return
    }
    toast.success("Two-factor authentication enabled")
    queryClient.setQueryData(authUserQueryOptions.queryKey, data?.user ?? null)
    router.invalidate()
  }

  if (step === "idle") {
    return (
      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-base font-medium">Enable 2FA</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your password to begin setup.
          </p>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="enable-password">Password</FieldLabel>
            <Input
              id="enable-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
        </FieldGroup>
        <Button
          onClick={handleEnable}
          disabled={!password || loading}
          variant="outline"
        >
          {loading ? "Generating…" : "Set up authenticator"}
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium">Scan QR code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open your authenticator app (Google Authenticator, Authy, etc.) and
          scan the code below.
        </p>
      </div>

      <div className="flex justify-center rounded-xl border bg-white p-6">
        <QRCode value={totpUri} size={180} />
      </div>

      {backupCodes.length > 0 && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-medium">Save your backup codes</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Store these somewhere safe. Each can be used once if you lose your
            authenticator.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {backupCodes.map((code) => (
              <code
                key={code}
                className="rounded bg-background px-2 py-1 text-xs font-mono"
              >
                {code}
              </code>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-medium">
          Enter the 6-digit code to confirm
        </p>
        <InputOTP
          maxLength={6}
          value={verifyCode}
          onChange={setVerifyCode}
          onComplete={handleVerify}
          containerClassName="w-full"
        >
          <InputOTPGroup className="flex-1 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-full *:data-[slot=input-otp-slot]:text-xl">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator className="mx-2" />
          <InputOTPGroup className="flex-1 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-full *:data-[slot=input-otp-slot]:text-xl">
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleVerify}
          disabled={verifyCode.length !== 6 || loading}
        >
          {loading ? "Verifying…" : "Confirm & enable"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setStep("idle")
            setTotpUri("")
            setBackupCodes([])
            setVerifyCode("")
          }}
        >
          Cancel
        </Button>
      </div>
    </section>
  )
}
