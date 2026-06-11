"use client"

import { useState } from "react"

import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"

type Props = {
  onSuccess: () => void
  onSwitchToOtp: () => void
}

type SubMode = "totp" | "backup"

export function TotpForm({ onSuccess, onSwitchToOtp }: Props) {
  const [subMode, setSubMode] = useState<SubMode>("totp")
  const [code, setCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleVerifyTotp() {
    if (code.length !== 6) return
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      setCode("")
      return
    }
    onSuccess()
  }

  async function handleVerifyBackup() {
    if (!backupCode.trim()) return
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code: backupCode.trim(),
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      setBackupCode("")
      return
    }
    onSuccess()
  }

  if (subMode === "backup") {
    return (
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

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setSubMode("totp")
              setBackupCode("")
            }}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-muted-foreground",
            })}
          >
            Use authenticator app instead
          </button>
          <button
            type="button"
            onClick={onSwitchToOtp}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-muted-foreground",
            })}
          >
            Get a code via email instead
          </button>
        </div>
      </div>
    )
  }

  return (
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

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onSwitchToOtp}
          className={buttonVariants({
            variant: "link",
            className: "h-auto p-0 text-sm text-muted-foreground",
          })}
        >
          Get a code via email instead
        </button>
        <button
          type="button"
          onClick={() => {
            setSubMode("backup")
            setCode("")
          }}
          className={buttonVariants({
            variant: "link",
            className: "h-auto p-0 text-sm text-muted-foreground",
          })}
        >
          Use a backup code
        </button>
      </div>
    </div>
  )
}
