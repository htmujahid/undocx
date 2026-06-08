import { queryOptions } from "@tanstack/react-query"

import { listAccountsAction } from "@/actions/auth/list-accounts-action"

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
  queryFn: () => listAccountsAction(),
})
