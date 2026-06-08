import { queryOptions } from "@tanstack/react-query"

import { sessionAction } from "@/actions/auth/session-action"

export const authUserQueryOptions = queryOptions({
  queryKey: ["auth-user"],
  queryFn: async () => {
    const data = await sessionAction()
    return data.user ?? null
  },
  staleTime: Infinity,
})
