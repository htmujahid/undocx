import type { ReactNode } from "react";
import { getCurrentUser } from "~@/lib/auth/session";

export async function AuthGate({ children }: { children: ReactNode }) {
  await getCurrentUser();
  return children;
}
