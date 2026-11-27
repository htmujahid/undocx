export const documentLimits = {
  title: 160,
  prompt: 2000,
  answer: 600,
  questions: 5,
  perUser: 100,
  contentBytes: 4_000_000,
} as const;

export const versionLimits = {
  name: 80,
  perDocument: 50,
} as const;
