import { NextResponse } from "next/server"

import { consumeAiGeneration } from "@/lib/db/queries/ai-usage"

export const DAILY_AI_LIMIT = 10

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
