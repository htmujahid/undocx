import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { Navbar } from "@/components/marketing/navbar"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/auth/sign-in" })
  },
  component: HomeLayout,
})

function HomeLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <Outlet />
    </div>
  )
}
