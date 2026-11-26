"use client";

import { createContext, use, type ReactNode } from "react";
import type { CurrentUser } from "~@/lib/auth/session";

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <UserContext value={user}>{children}</UserContext>;
}

export function useUser(): CurrentUser {
  const user = use(UserContext);
  if (!user) throw new Error("useUser must be used inside UserProvider");
  return user;
}
