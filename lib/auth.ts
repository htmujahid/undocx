import { cache } from "react"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { twoFactor } from "better-auth/plugins"
import { headers } from "next/headers"

import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"
import {
  sendChangeEmailVerification,
  sendDeleteAccountVerification,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "@/lib/mail/auth-emails"

const trustedOrigins = [
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
]

export const auth = betterAuth({
  appName: "Undocx",
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ user, url })
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      requireVerification: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url,
      }: {
        user: { name: string; email: string }
        newEmail: string
        url: string
      }) => {
        await sendChangeEmailVerification({ user, newEmail, url })
      },
    },
    deleteUser: {
      enabled: true,
      deleteSessions: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerification({ user, url })
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ user, url })
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(workspace).values({
            name: "Demo Workspace",
            ownerId: user.id,
          })
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendOtpEmail({ user, otp })
        },
      },
    }),
    nextCookies(),
  ],
})

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})
