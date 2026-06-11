"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function setPassword(newPassword: string) {
  await auth.api.setPassword({ body: { newPassword }, headers: await headers() })
}
