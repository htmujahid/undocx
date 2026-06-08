import { sessionAction } from "@/actions/auth/session-action"
import { queryOptions } from "@tanstack/react-query"

export const authUserQueryOptions = queryOptions({
  queryKey: ["auth-user"],
  queryFn: async () => {
    const data = await sessionAction()
    return data.user ?? null
  },
  staleTime: Infinity,
})
