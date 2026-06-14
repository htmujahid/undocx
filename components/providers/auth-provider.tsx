"use client"

import { createContext, useContext } from "react"
import type * as React from "react"

import { authClient } from "@/lib/auth-client"

type Session = typeof authClient.$Infer.Session
type User = Session["user"]

interface AuthContextValue {
  session: Session | null
  user: User | null
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
})

export function AuthProvider({
  children,
  session: initialSession = null,
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  const { data: clientSession } = authClient.useSession()
  const session = clientSession === undefined ? initialSession : clientSession

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
