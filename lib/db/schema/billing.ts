import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const subscription = pgTable(
  "subscription",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text().notNull(),
    status: text().notNull(),
    currentPeriodStart: timestamp().notNull(),
    currentPeriodEnd: timestamp().notNull(),
    cancelAtPeriodEnd: boolean().notNull().default(false),
    canceledAt: timestamp(),
    endsAt: timestamp(),
    endedAt: timestamp(),
    modifiedAt: timestamp().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("subscription_user_idx").on(table.userId)],
);
