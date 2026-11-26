import type { ReactNode } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { UserProvider } from "./user-provider";

export async function AuthGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return <UserProvider user={user}>{children}</UserProvider>;
}
