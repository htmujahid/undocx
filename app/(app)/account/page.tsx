import Link from "next/link"

import { ProfileForm } from "@/components/account/profile-form"
import { getSession } from "@/lib/auth"

export const metadata = {
  title: "Profile",
}

export default async function AccountPage() {
  const session = await getSession()
  const user = session!.user

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your display name and personal details.
        </p>
      </div>

      <div className="space-y-8 border-t pt-8">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-base font-medium">
            {initials}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Email address</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            To change your email address, go to{" "}
            <Link
              href="/account/security"
              className="text-foreground underline underline-offset-4"
            >
              Security
            </Link>
            .
          </p>
        </div>

        <ProfileForm defaultName={user.name ?? ""} />
      </div>
    </div>
  )
}
