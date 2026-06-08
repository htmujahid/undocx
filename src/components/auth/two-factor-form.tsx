import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { authUserQueryOptions } from "@/lib/queries/auth"
import { toast } from "sonner"

export function TwoFactorForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"totp" | "backup">("totp")
  const [code, setCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleVerifyTotp() {
    if (code.length !== 6) return
    setLoading(true)
    const { data, error } = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      setCode("")
      return
    }
    queryClient.setQueryData(authUserQueryOptions.queryKey, data?.user ?? null)
    navigate({ to: "/home" })
  }

  async function handleVerifyBackup() {
    if (!backupCode.trim()) return
    setLoading(true)
    const { data, error } = await authClient.twoFactor.verifyBackupCode({
      code: backupCode.trim(),
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      setBackupCode("")
      return
    }
    queryClient.setQueryData(authUserQueryOptions.queryKey, data?.user ?? null)
    navigate({ to: "/home" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Two-factor verification
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter one of your backup codes to regain access."}
        </p>
      </div>

      {mode === "totp" ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={handleVerifyTotp}
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

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="rounded border-input accent-primary"
              />
              Trust this device for 30 days
            </label>
          </div>

          <Button
            onClick={handleVerifyTotp}
            disabled={code.length !== 6 || loading}
            className="w-full"
          >
            {loading ? "Verifying…" : "Verify"}
          </Button>

          <button
            type="button"
            onClick={() => { setMode("backup"); setCode("") }}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-muted-foreground",
            })}
          >
            Use a backup code instead
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <input
            type="text"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value)}
            placeholder="xxxx-xxxx-xxxx"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="off"
            spellCheck={false}
          />

          <Button
            onClick={handleVerifyBackup}
            disabled={!backupCode.trim() || loading}
            className="w-full"
          >
            {loading ? "Verifying…" : "Verify backup code"}
          </Button>

          <button
            type="button"
            onClick={() => { setMode("totp"); setBackupCode("") }}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-muted-foreground",
            })}
          >
            Use authenticator app instead
          </button>
        </div>
      )}
    </div>
  )
}
