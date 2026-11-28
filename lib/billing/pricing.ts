const perMillion: Record<string, { input: number; output: number }> = {
  "gpt-6-astra": { input: 10, output: 50 },
  "gpt-6-luna": { input: 0.1, output: 0.5 },
  "gpt-5.4": { input: 2.5, output: 15 },
  "gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "gpt-5.4-nano": { input: 0.2, output: 1.25 },
};

const fallback = perMillion["gpt-5.4-mini"];

export function costMicros(model: string, usage: { inputTokens?: number; outputTokens?: number }) {
  const price = perMillion[model] ?? fallback;
  return Math.ceil((usage.inputTokens ?? 0) * price.input + (usage.outputTokens ?? 0) * price.output);
}
