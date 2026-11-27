import "server-only";

import { getUserId } from "~@/lib/auth/session";
import { insertRun } from "~@/lib/db/repository/ai";
import { modelId } from "./model";

export function problem(status: number, error: string) {
  return Response.json({ error }, { status });
}

export function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/api key|authenticat|unauthori[sz]ed|incorrect key/i.test(message)) return "The assistant is not set up yet. Add an OpenAI API key to the environment.";
  if (/rate limit|too many requests|quota/i.test(message)) return "The assistant is busy. Try again in a moment.";
  return "The assistant could not answer. Try again.";
}

export const authorize = getUserId;

type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };

export function trackRun(base: { userId: string; kind: string; documentId?: string; threadId?: string }) {
  const startedAt = Date.now();
  const record = (fields: Partial<Parameters<typeof insertRun>[0]>) => insertRun({ ...base, model: modelId, status: "ok", durationMs: Date.now() - startedAt, ...fields }).catch(() => undefined);
  return {
    onEnd: async ({ usage, finishReason }: { usage: Usage; finishReason: string }) => {
      await record({ finishReason, inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0, totalTokens: usage.totalTokens ?? 0 });
    },
    onError: async ({ error }: { error: unknown }) => {
      console.error(`[ai:${base.kind}]`, error);
      await record({ status: "error", error: describeError(error) });
    },
  };
}
