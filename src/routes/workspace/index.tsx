import { useEffect, useState } from "react"

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
  // Lexical and @tanstack/ai-react use browser-only APIs (MutationObserver,
  // ResizeObserver). useEffect never runs on the server, so this gate ensures
  // the editor is only mounted after hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!user || !mounted) return null
  return <Workspace user={user} data={data} />
}
