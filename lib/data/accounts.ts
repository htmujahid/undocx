import { queryOptions } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"

export type Account = {
  id: string
  accountId: string
  providerId: string
  createdAt: Date
  updatedAt: Date
  scopes: string[]
}

export const listAccountsQueryOptions = queryOptions({
  queryKey: ["accounts"],
  queryFn: () => authClient.listAccounts(),
})
