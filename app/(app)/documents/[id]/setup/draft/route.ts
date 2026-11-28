import { generateId, generateText, Output } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { draftToContent } from "~@/lib/ai/draft";
import { getModel } from "~@/lib/ai/model";
import { briefMessage, draftInstructions } from "~@/lib/ai/prompts";
import { callOptions } from "~@/lib/ai/options";
import { authorize, describeError, problem, beginRun } from "~@/lib/ai/route";
import { draftOutputSchema } from "~@/lib/ai/schemas";
import { ensureThread, saveThreadMessages } from "~@/lib/db/repository/ai";
import { findBrief, finishDraft } from "~@/lib/db/repository/brief";
import { insertVersion } from "~@/lib/db/repository/version";
import type { OutlineMode } from "~@/lib/documents/brief";
import { summarizeContent } from "~@/lib/documents/content";
import { documentLimits } from "~@/lib/documents/limits";

export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/setup/draft">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to continue.");
  const { id } = await params;
  const found = await findBrief(userId, id);
  if (!found) return problem(404, "This document no longer exists.");
  if (found.document.status !== "drafting") return problem(409, "This document is already set up.");
  const { document, brief } = found;

  const context = await loadContext(userId, document);
  const gate = await beginRun({ userId, documentId: id, kind: "setup-draft", task: "draft" });
  if (gate.denied) return gate.denied;
  const { run } = gate;
  try {
    const message = briefMessage({ prompt: brief.prompt, questions: brief.questions, answers: brief.answers });
    const result = await generateText({
      model: getModel(gate.model),
      ...callOptions({ userId, signal: request.signal, effort: "medium", seconds: 150 }),
      instructions: draftInstructions({ ...context, typeKey: document.type, outline: brief.outline as OutlineMode, advice: brief.advice?.recommended ?? null }),
      prompt: message,
      output: Output.object({ schema: draftOutputSchema }),
    });
    await run.onEnd({ usage: result.usage, finishReason: result.finishReason });

    const content = draftToContent(result.output.blocks, context.sources.map((item) => item.id));
    const summary = summarizeContent(content);
    if (summary.wordCount === 0) throw new Error("The draft was empty");
    const title = result.output.title.trim().slice(0, documentLimits.title) || document.title;
    if (!(await finishDraft(userId, id, { title, content, ...summary }))) return problem(409, "This document is already set up.");

    await insertVersion(userId, id, { kind: "ai", label: "First draft", content, wordCount: summary.wordCount }, gate.limits.versionsPerDocument);

    const thread = await ensureThread(userId, id);
    if (thread) {
      await saveThreadMessages(thread.id, [
        { id: generateId(), role: "user", parts: [{ type: "text", text: message }] },
        { id: generateId(), role: "assistant", parts: [{ type: "text", text: result.output.note.trim() || "I wrote a first draft from your brief." }] },
      ]);
    }
    return Response.json({ id });
  } catch (error) {
    await run.onError({ error });
    return problem(500, describeError(error));
  }
}
