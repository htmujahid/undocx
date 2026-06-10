import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"

export const listAccountsAction = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    return auth.api.listUserAccounts({ headers })
  }
)
