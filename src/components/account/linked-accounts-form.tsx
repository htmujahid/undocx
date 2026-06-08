import { useState } from "react"

import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { type Account, listAccountsQueryOptions } from "@/lib/queries/accounts"
import { toast } from "sonner"

const OAUTH_PROVIDERS = [
  {
    id: "google",
    name: "Google",
    description: "Sign in with your Google account",
    icon: GoogleIcon,
  },
] as const

export function LinkedAccountsForm({ accounts }: { accounts: Account[] }) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<string | null>(null)

  const oauthAccounts = accounts.filter((a) => a.providerId !== "credential")

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: listAccountsQueryOptions.queryKey,
    })

  const handleConnect = async (providerId: string) => {
    setPending(providerId)
    await authClient.linkSocial({
      provider: providerId as "google",
      callbackURL: "/account/security",
    })
  }

  const handleDisconnect = async (providerId: string) => {
    setPending(providerId)
    const { error } = await authClient.unlinkAccount({ providerId })
    setPending(null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Account disconnected")
    await invalidate()
  }

  return (
    <section className="space-y-4 border-t pt-8">
      <div>
        <h2 className="text-base font-medium">Connected accounts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Link social providers for additional sign-in options.
        </p>
      </div>

      <div className="space-y-3">
        {OAUTH_PROVIDERS.map(({ id, name, description, icon: Icon }) => {
          const linked = oauthAccounts.some((a) => a.providerId === id)
          const canDisconnect = linked && accounts.length > 1
          const isBusy = pending === id

          return (
            <Card key={id} size="sm" className="w-full shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  {name}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardAction>
                  {linked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canDisconnect || isBusy}
                      onClick={() => handleDisconnect(id)}
                    >
                      {isBusy ? "Disconnecting…" : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleConnect(id)}
                    >
                      {isBusy ? "Connecting…" : "Connect"}
                    </Button>
                  )}
                </CardAction>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
