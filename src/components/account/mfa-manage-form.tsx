import { useState } from "react"

import { toast } from "sonner"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { authUserQueryOptions } from "@/lib/queries/auth"

export function MfaManageForm() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [disablePassword, setDisablePassword] = useState("")
  const [disableLoading, setDisableLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

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
    queryClient.setQueryData(authUserQueryOptions.queryKey, (old) =>
      old ? { ...old, twoFactorEnabled: false } : null
    )
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
    <>
      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-base font-medium">Backup codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate new backup codes. Your current codes will be invalidated.
          </p>
        </div>

        {newBackupCodes.length > 0 && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium">Your new backup codes</p>
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

      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-base font-medium text-destructive">
            Disable 2FA
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Removing 2FA reduces your account security. Enter your password to
            confirm.
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
  )
}
