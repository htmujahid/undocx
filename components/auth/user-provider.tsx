"use client";

import { createContext, use, type ReactNode } from "react";
import type { CurrentUser } from "~@/lib/auth/session";

const UserContext = createContext<Promise<CurrentUser | null> | null>(null);

export function UserProvider({ user, children }: { user: Promise<CurrentUser | null>; children: ReactNode }) {
  return <UserContext value={user}>{children}</UserContext>;
}

export function useOptionalUser(): CurrentUser | null {
  const user = use(UserContext);
  if (!user) throw new Error("useOptionalUser must be used inside UserProvider");
  return use(user);
}

export function useUser(): CurrentUser {
  const user = useOptionalUser();
  if (!user) throw new Error("useUser needs a signed-in user");
  return user;
}
