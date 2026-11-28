export type QuestionKind = "single" | "multi" | "yesno" | "text";
export type BriefQuestion = { id: string; question: string; kind?: QuestionKind; choices: string[]; hint?: string };

export const multiSeparator = "; ";
export const yesNoChoices = ["Yes", "No"];

export function kindOf(question: BriefQuestion): QuestionKind {
  return question.kind ?? "single";
}
export type BriefAnswers = Record<string, string | null>;
export type OutlineAdvice = { recommended: boolean; reason: string };
export type OutlineMode = "auto" | "on" | "off";

export const outlineModes: { value: OutlineMode; label: string; description: string }[] = [
  { value: "auto", label: "Let Undocx decide", description: "It looks at the brief and your answers." },
  { value: "on", label: "With an outline", description: "A title, then sections with short headings." },
  { value: "off", label: "Without one", description: "Flowing text with few or no headings." },
];

export function nextQuestion(questions: BriefQuestion[], answers: BriefAnswers) {
  return questions.find((question) => !(question.id in answers)) ?? null;
}
