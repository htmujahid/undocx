import { generateText, Output } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { questionsInstructions } from "~@/lib/ai/prompts";
import { authorize, describeError, problem, trackRun } from "~@/lib/ai/route";
import { questionsOutputSchema } from "~@/lib/ai/schemas";
import { findBrief, saveQuestions } from "~@/lib/db/repository/brief";
import type { BriefQuestion } from "~@/lib/documents/brief";
import { documentLimits } from "~@/lib/documents/limits";

function cleanQuestions(raw: { id: string; question: string; choices: string[] }[]) {
  const seen = new Set<string>();
  const questions: BriefQuestion[] = [];
  for (const [index, item] of raw.entries()) {
    const question = item.question.trim();
    const choices = item.choices.map((choice) => choice.trim()).filter(Boolean).slice(0, 4);
    if (!question || questions.length >= documentLimits.questions) continue;
    let id = item.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || `question-${index + 1}`;
    if (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    questions.push({ id, question, choices });
  }
  return questions;
}

export async function POST(_request: Request, { params }: RouteContext<"/documents/[id]/setup/questions">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to continue.");
  const { id } = await params;
  const found = await findBrief(userId, id);
  if (!found) return problem(404, "This document no longer exists.");
  if (found.document.status !== "drafting") return problem(409, "This document is already set up.");

  const context = await loadContext(userId, found.document);
  const run = trackRun({ userId, documentId: id, kind: "setup-questions" });
  try {
    const result = await generateText({
      model: getModel(),
      instructions: questionsInstructions({ ...context, typeKey: found.document.type }),
      prompt: found.brief.prompt,
      output: Output.object({ schema: questionsOutputSchema }),
    });
    await run.onEnd({ usage: result.usage, finishReason: result.finishReason });
    const questions = cleanQuestions(result.output.questions);
    const advice = { recommended: result.output.outline.recommended, reason: result.output.outline.reason.trim() };
    await saveQuestions(id, questions, advice, result.output.type === "other" ? null : result.output.type);
    return Response.json({ questions, advice });
  } catch (error) {
    await run.onError({ error });
    return problem(502, describeError(error));
  }
}
