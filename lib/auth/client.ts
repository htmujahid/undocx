import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ plugins: [polarClient()] });

export const { useSession, signIn, signOut, deleteUser } = authClient;
