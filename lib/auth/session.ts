import "server-only";

import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "./index";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getUserId() {
  const session = await getSession();
  return session ? session.user.id : null;
}

export async function getOptionalUser(): Promise<CurrentUser | null> {
  "use cache: private";
  cacheLife("minutes");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await getOptionalUser();
  if (!user) redirect("/?login");
  return user;
}

export async function requireUserId() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}
