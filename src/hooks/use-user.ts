import { getRouteApi } from "@tanstack/react-router"

export function useUser() {
  const { user } = getRouteApi("__root__").useRouteContext()
  return { user }
}
