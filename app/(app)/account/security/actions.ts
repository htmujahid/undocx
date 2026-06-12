"use server"

import { headers } from "next/headers"

import { auth, getSession } from "@/lib/auth"

export async function setPassword(newPassword: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  })
}
