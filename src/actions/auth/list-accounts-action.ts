import { createServerFn } from "@tanstack/react-start"

import { auth } from "@/lib/auth"
import { getRequestHeaders } from "@tanstack/react-start/server"

export const listAccountsAction = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    return auth.api.listUserAccounts({ headers })
  }
)
