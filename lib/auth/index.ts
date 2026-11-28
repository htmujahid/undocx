import "server-only";

import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { createPolarCore } from "@polar-sh/sdk/2026-10";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { syncSubscription } from "~@/lib/billing/webhook";
import { db } from "~@/lib/db";
import { hasActiveSubscription } from "~@/lib/db/repository/billing";
import { deletePrefix } from "~@/lib/storage/s3";
import * as schema from "~@/lib/db/schema";

const appUrl = process.env.BETTER_AUTH_URL!;

const polarClient = createPolarCore({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  environment: process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox",
  ...(process.env.POLAR_BASE_URL ? { baseUrl: process.env.POLAR_BASE_URL } : {}),
});

export const auth = betterAuth({
  appName: "Undocx",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        if (await hasActiveSubscription(user.id)) {
          throw new APIError("BAD_REQUEST", { message: "Cancel your Pro subscription before deleting your account.", code: "ACTIVE_SUBSCRIPTION" });
        }
        await deletePrefix(`users/${user.id}/`);
      },
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [{ productId: process.env.POLAR_PRO_PRODUCT_ID!, slug: "pro" }],
          successUrl: `${appUrl}/account?upgraded=1`,
          returnUrl: `${appUrl}/account`,
          authenticatedUsersOnly: true,
        }),
        portal({ returnUrl: `${appUrl}/account` }),
        webhooks({ secret: process.env.POLAR_WEBHOOK_SECRET!, onPayload: syncSubscription }),
      ],
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
