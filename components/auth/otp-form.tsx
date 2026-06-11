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
  onSwitchToTotp: () => void
}

export function OtpForm({ onSuccess, onSwitchToTotp }: Props) {
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    setLoading(true)
    const { error } = await authClient.twoFactor.sendOtp()
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
    toast.success("Code sent to your email")
  }

  async function handleVerify() {
    if (code.length !== 6) return
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyOtp({
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

  return (
    <div className="flex flex-col gap-5">
      {!sent ? (
        <Button onClick={handleSend} disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send code to email"}
        </Button>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
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
            onClick={handleVerify}
            disabled={code.length !== 6 || loading}
            className="w-full"
          >
            {loading ? "Verifying…" : "Verify"}
          </Button>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-muted-foreground",
            })}
          >
            Resend code
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onSwitchToTotp}
        className={buttonVariants({
          variant: "link",
          className: "h-auto p-0 text-sm text-muted-foreground",
        })}
      >
        Use authenticator app instead
      </button>
    </div>
  )
}
