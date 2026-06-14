import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core"

import { user } from "./auth-schema"

// Tracks how many AI generations a user has made on a given UTC day.
// One row per (user, day); `count` is incremented on each AI call.
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // UTC date as YYYY-MM-DD
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.day] })]
)
