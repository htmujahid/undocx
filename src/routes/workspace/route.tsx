import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/workspace")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/auth/sign-in" })
  },
  component: WorkspaceLayout,
})

function WorkspaceLayout() {
  return <Outlet />
}
