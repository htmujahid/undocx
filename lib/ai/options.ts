import "server-only";

import { createHash } from "node:crypto";

type Effort = "low" | "medium";

export function callOptions({ userId, signal, effort = "low", seconds = 90 }: { userId: string; signal: AbortSignal; effort?: Effort; seconds?: number }) {
  return {
    reasoning: effort,
    abortSignal: signal,
    timeout: { totalMs: seconds * 1000 },
    providerOptions: {
      openai: { store: false, safetyIdentifier: createHash("sha256").update(userId).digest("hex") },
    },
  } as const;
}
