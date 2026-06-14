import { NextResponse } from "next/server"

import { consumeAiGeneration } from "@/lib/db/queries/ai-usage"

// Maximum AI generations a user may make per day. Any AI call counts as one.
export const DAILY_AI_LIMIT = 10

/**
 * Records one AI generation against the user's daily quota and returns a 429
 * response when the limit is exhausted. Returns `null` when the call is allowed,
 * so route handlers can do:
 *
 *   const limited = await enforceDailyAiLimit(session.user.id)
 *   if (limited) return limited
 */
export async function enforceDailyAiLimit(userId: string) {
  const { allowed, remaining } = await consumeAiGeneration(userId, DAILY_AI_LIMIT)

  const headers = {
    "X-AI-Daily-Limit": String(DAILY_AI_LIMIT),
    "X-AI-Daily-Remaining": String(remaining),
  }

  if (!allowed) {
    return NextResponse.json(
      {
        error: `You've reached your daily limit of ${DAILY_AI_LIMIT} AI generations. Please try again tomorrow.`,
      },
      { status: 429, headers }
    )
  }

  return null
}
