import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export async function getUserByEmail(email: string) {
  const [found] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
  return found ?? null
}

export async function getUserById(userId: string) {
  const [found] = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, userId))
  return found ?? null
}
