import { createFileRoute } from "@tanstack/react-router"

import { Workspace } from "@/components/workspace/workspace"

import { data } from "./_data"

export const Route = createFileRoute("/workspace/")({
  loader: () => {
    return { data }
  },
  component: HomePage,
})

function HomePage() {
  const { user } = Route.useRouteContext()
  const { data } = Route.useLoaderData()

  if (!user) return null

  return <Workspace user={user} data={data} />
}
