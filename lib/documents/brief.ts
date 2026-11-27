export type BriefQuestion = { id: string; question: string; choices: string[] };
export type BriefAnswers = Record<string, string | null>;
export type OutlineAdvice = { recommended: boolean; reason: string };
export type OutlineMode = "auto" | "on" | "off";

export const outlineModes: { value: OutlineMode; label: string }[] = [
  { value: "auto", label: "Let Undocx decide" },
  { value: "on", label: "With an outline" },
  { value: "off", label: "Without one" },
];

export function nextQuestion(questions: BriefQuestion[], answers: BriefAnswers) {
  return questions.find((question) => !(question.id in answers)) ?? null;
}
