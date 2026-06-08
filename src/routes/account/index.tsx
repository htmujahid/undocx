import { createFileRoute } from "@tanstack/react-router"

import { ProfileForm } from "@/components/account/profile-form"

export const Route = createFileRoute("/account/")({
  component: ProfilePage,
})

function ProfilePage() {
  return <ProfileForm />
}
