import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/auth/sign-in" })
  },
  component: HomeLayout,
})

function HomeLayout() {
  return <Outlet />
}
