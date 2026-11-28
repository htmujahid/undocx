import "server-only";

import { APICallError, LoadAPIKeyError } from "ai";
import { getUserId } from "~@/lib/auth/session";
import { insertRun } from "~@/lib/db/repository/ai";
import { costMicros } from "~@/lib/billing/pricing";
import { getEntitlement, usageSince } from "~@/lib/db/repository/billing";
import { modelFor, type Task } from "./model";

export function problem(status: number, error: string) {
  return Response.json({ error }, { status });
}

const notSetUp = "The assistant is not set up yet. Add an OpenAI API key to the environment.";

export function describeError(error: unknown) {
  if (LoadAPIKeyError.isInstance(error)) return notSetUp;
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403) return notSetUp;
    if (error.statusCode === 429) return "The assistant is busy. Try again in a moment.";
  }
  return "The assistant could not answer. Try again.";
}

export const authorize = getUserId;

type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };

const inFlight = new Map<string, number>();

function release(userId: string) {
  const left = (inFlight.get(userId) ?? 1) - 1;
  if (left <= 0) inFlight.delete(userId);
  else inFlight.set(userId, left);
}

const dateFormat = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" });

export async function beginRun(base: { userId: string; kind: string; task: Task; documentId?: string; threadId?: string }) {
  const { userId, task } = base;
  const { plan, limits, window } = await getEntitlement(userId);
  const upgrade = plan === "free" ? " Upgrade to Pro for more." : "";
  const hour = new Date(Date.now() - 60 * 60 * 1000);
  const [month, recent] = await Promise.all([usageSince(userId, window.start), usageSince(userId, hour)]);
  if (month.micros >= limits.allowanceMicros) {
    return { denied: problem(402, `You have used this period's AI allowance. It resets on ${dateFormat.format(window.end)}.${upgrade}`) };
  }
  if (recent.runs >= limits.burstPerHour) {
    return { denied: problem(429, `You have reached the hourly limit for AI requests. Try again later.${upgrade}`) };
  }
  if ((inFlight.get(userId) ?? 0) >= limits.concurrent) {
    return { denied: problem(429, "Wait for the current AI request to finish before starting another.") };
  }
  inFlight.set(userId, (inFlight.get(userId) ?? 0) + 1);

  const model = modelFor(task, plan);
  const startedAt = Date.now();
  let settled = false;
  const record = async (fields: Partial<Parameters<typeof insertRun>[0]>) => {
    if (settled) return;
    settled = true;
    release(userId);
    await insertRun({ userId, kind: base.kind, documentId: base.documentId, threadId: base.threadId, model, status: "ok", durationMs: Date.now() - startedAt, ...fields }).catch(() => undefined);
  };
  const run = {
    onEnd: async ({ usage, finishReason }: { usage: Usage; finishReason: string }) => {
      await record({
        finishReason,
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        costMicros: costMicros(model, usage),
      });
    },
    onAbort: async () => {
      await record({ status: "aborted" });
    },
    onError: async ({ error }: { error: unknown }) => {
      console.error(`[ai:${base.kind}]`, error);
      await record({ status: "error", error: describeError(error) });
    },
  };
  return { denied: null, model, plan, limits, run };
}
