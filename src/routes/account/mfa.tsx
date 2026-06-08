import { createFileRoute, useRouter } from "@tanstack/react-router"

import { useState } from "react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/account/mfa")({
  component: MfaPage,
})

type EnableStep = "idle" | "setup" | "verify"

function MfaPage() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const isEnabled = !!user?.twoFactorEnabled

  const [enableStep, setEnableStep] = useState<EnableStep>("idle")
  const [enablePassword, setEnablePassword] = useState("")
  const [totpUri, setTotpUri] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState("")
  const [enableLoading, setEnableLoading] = useState(false)

  const [disablePassword, setDisablePassword] = useState("")
  const [disableLoading, setDisableLoading] = useState(false)

  const [backupLoading, setBackupLoading] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

  async function handleEnable() {
    if (!enablePassword) return
    setEnableLoading(true)
    const { data, error } = await authClient.twoFactor.enable({
      password: enablePassword,
    })
    setEnableLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    if (data?.totpURI) {
      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes ?? [])
      setEnableStep("setup")
    }
  }

  async function handleVerifyEnable() {
    if (verifyCode.length !== 6) return
    setEnableLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    })
    setEnableLoading(false)
    if (error) {
      toast.error(error.message)
      setVerifyCode("")
      return
    }
    toast.success("Two-factor authentication enabled")
    setEnableStep("idle")
    setEnablePassword("")
    setTotpUri("")
    setVerifyCode("")
    router.invalidate()
  }

  async function handleDisable() {
    if (!disablePassword) return
    setDisableLoading(true)
    const { error } = await authClient.twoFactor.disable({
      password: disablePassword,
    })
    setDisableLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Two-factor authentication disabled")
    setDisablePassword("")
    setNewBackupCodes([])
    router.invalidate()
  }

  async function handleRegenerateBackupCodes() {
    setBackupLoading(true)
    const { data, error } = await authClient.twoFactor.generateBackupCodes({
      password: disablePassword,
    })
    setBackupLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setNewBackupCodes(data?.backupCodes ?? [])
    toast.success("Backup codes regenerated")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Multi-factor authentication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an extra layer of security to your account with an authenticator
          app.
        </p>
      </div>

      {/* Status banner */}
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

      {!isEnabled && (
        <section className="space-y-5 border-t pt-8">
          {enableStep === "idle" && (
            <>
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
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>
              </FieldGroup>
              <Button
                onClick={handleEnable}
                disabled={!enablePassword || enableLoading}
                variant="outline"
              >
                {enableLoading ? "Generating…" : "Set up authenticator"}
              </Button>
            </>
          )}

          {enableStep === "setup" && (
            <>
              <div>
                <h2 className="text-base font-medium">Scan QR code</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open your authenticator app (Google Authenticator, Authy, etc.)
                  and scan the code below.
                </p>
              </div>

              <div className="flex justify-center rounded-xl border bg-white p-6">
                <QRCode value={totpUri} size={180} />
              </div>

              {backupCodes.length > 0 && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium">
                    Save your backup codes
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Store these codes somewhere safe. Each can be used once to
                    access your account if you lose your authenticator.
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
                  onComplete={handleVerifyEnable}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyEnable}
                  disabled={verifyCode.length !== 6 || enableLoading}
                >
                  {enableLoading ? "Verifying…" : "Confirm & enable"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnableStep("idle")
                    setTotpUri("")
                    setBackupCodes([])
                    setVerifyCode("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      {isEnabled && (
        <>
          {/* Backup codes */}
          <section className="space-y-5 border-t pt-8">
            <div>
              <h2 className="text-base font-medium">Backup codes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate new backup codes. Your current codes will be
                invalidated.
              </p>
            </div>

            {newBackupCodes.length > 0 && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-3 text-sm font-medium">
                  Your new backup codes
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Save these now — they won't be shown again.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {newBackupCodes.map((code) => (
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

            <Button
              variant="outline"
              onClick={handleRegenerateBackupCodes}
              disabled={backupLoading}
            >
              {backupLoading ? "Generating…" : "Regenerate backup codes"}
            </Button>
          </section>

          {/* Disable 2FA */}
          <section className="space-y-5 border-t pt-8">
            <div>
              <h2 className="text-base font-medium text-destructive">
                Disable 2FA
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Removing 2FA reduces your account security. Enter your password
                to confirm.
              </p>
            </div>

            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="disable-password">Password</FieldLabel>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>
              </FieldGroup>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={!disablePassword || disableLoading}
              >
                {disableLoading ? "Disabling…" : "Disable 2FA"}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
