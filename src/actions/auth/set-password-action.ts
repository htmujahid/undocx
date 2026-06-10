import { z } from "zod"

import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"

export const setPasswordAction = createServerFn({ method: "POST" })
  .validator(z.object({ newPassword: z.string().min(8) }))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    await auth.api.setPassword({
      body: { newPassword: data.newPassword },
      headers,
    })
  })
