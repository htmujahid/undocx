import { cache } from "react"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { twoFactor } from "better-auth/plugins"
import { headers } from "next/headers"

import { db } from "@/lib/db"
import { mailer } from "@/lib/mailer"

export const auth = betterAuth({
  appName: "Renderical",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void mailer.sendMail({
        from: "noreply@renderical.com",
        to: user.email,
        subject: "Reset your password",
        html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
      })
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
        void mailer.sendMail({
          from: "noreply@renderical.com",
          to: user.email,
          subject: "Change your email address",
          html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to change your email to ${newEmail}</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
        })
      },
    },
    deleteUser: {
      enabled: true,
      deleteSessions: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        void mailer.sendMail({
          from: "noreply@renderical.com",
          to: user.email,
          subject: "Delete your account",
          html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to delete your account</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
        })
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void mailer.sendMail({
        from: "noreply@renderical.com",
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to verify your email</p><p>Or copy and paste the link below into your browser:</p><p>${url}</p>`,
      })
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
          void mailer.sendMail({
            from: "noreply@renderical.com",
            to: user.email,
            subject: "Your verification code",
            html: `<p>Hi ${user.name},</p><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 3 minutes. Do not share it with anyone.</p>`,
          })
        },
      },
    }),
    nextCookies(),
  ],
})

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})
