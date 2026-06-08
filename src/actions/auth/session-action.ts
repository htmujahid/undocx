import { createServerFn } from "@tanstack/react-start"

import { auth } from "@/lib/auth"
import { getRequestHeaders } from "@tanstack/react-start/server"

export const sessionAction = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const response = await auth.api.getSession({ headers })

    return {
      session: response?.session,
      user: response?.user,
    }
  }
)
