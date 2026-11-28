export type PlanId = "free" | "pro";

export type PlanLimits = {
  allowanceMicros: number;
  burstPerHour: number;
  concurrent: number;
  documentChars: number;
  sourceChars: number;
  historyMessages: number;
  documents: number;
  versionsPerDocument: number;
  profiles: number;
  voices: number;
  voiceSamples: number;
  ruleSets: number;
  rulesPerSet: number;
  sources: number;
  sourcesPerDocument: number;
  fileBytes: number;
};

const MB = 1024 * 1024;

export const plans: Record<PlanId, { name: string; priceUsd: number; limits: PlanLimits }> = {
  free: {
    name: "Free",
    priceUsd: 0,
    limits: {
      allowanceMicros: 200_000,
      burstPerHour: 10,
      concurrent: 1,
      documentChars: 12_000,
      sourceChars: 12_000,
      historyMessages: 10,
      documents: 5,
      versionsPerDocument: 3,
      profiles: 1,
      voices: 1,
      voiceSamples: 5,
      ruleSets: 1,
      rulesPerSet: 20,
      sources: 10,
      sourcesPerDocument: 3,
      fileBytes: 5 * MB,
    },
  },
  pro: {
    name: "Pro",
    priceUsd: 10,
    limits: {
      allowanceMicros: 2_000_000,
      burstPerHour: 40,
      concurrent: 2,
      documentChars: 30_000,
      sourceChars: 30_000,
      historyMessages: 20,
      documents: 100,
      versionsPerDocument: 10,
      profiles: 10,
      voices: 10,
      voiceSamples: 10,
      ruleSets: 10,
      rulesPerSet: 60,
      sources: 100,
      sourcesPerDocument: 20,
      fileBytes: 10 * MB,
    },
  },
};

export const entitledStatuses = ["active", "trialing", "past_due"] as const;

export function isEntitled(status: string) {
  return (entitledStatuses as readonly string[]).includes(status);
}

export function monthWindow(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export function percentUsed(usedMicros: number, allowanceMicros: number) {
  return Math.min(100, Math.floor((usedMicros / allowanceMicros) * 100));
}

export function limitMessage(plan: PlanId, what: string, key: keyof PlanLimits) {
  const own = plans[plan].limits[key];
  if (plan === "pro") return `Your plan limit for ${what} is ${own}.`;
  return `The Free plan limit for ${what} is ${own}. Upgrade to Pro for up to ${plans.pro.limits[key]}.`;
}
