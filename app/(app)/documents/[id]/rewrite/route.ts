import { generateText, Output } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { editMessage, rewriteInstructions } from "~@/lib/ai/prompts";
import { callOptions } from "~@/lib/ai/options";
import { authorize, describeError, problem, trackRun } from "~@/lib/ai/route";
import { rewriteOutputSchema, rewriteRequestSchema } from "~@/lib/ai/schemas";
import { findDocument } from "~@/lib/db/repository/document";

export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/rewrite">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to edit with Undocx.");
  const { id } = await params;

  const parsed = rewriteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That edit could not be read.");
  const { action, instruction, items, context } = parsed.data;

  const editable = new Set(items.filter((item) => !item.locked && item.kind !== "other").map((item) => item.index));
  const focus = parsed.data.focus.filter((index) => editable.has(index));
  if (focus.length === 0) return problem(422, "There is nothing here Undocx can change. Locked blocks are left alone.");

  const doc = await findDocument(userId, id);
  if (!doc) return problem(404, "This document no longer exists.");

  const run = trackRun({ userId, documentId: id, kind: action });
  try {
    const result = await generateText({
      model: getModel(),
      ...callOptions({ userId, signal: request.signal, effort: "low", seconds: 90 }),
      instructions: rewriteInstructions({ ...(await loadContext(userId, doc)), action, instruction }),
      prompt: editMessage({ items, focus, context }),
      output: Output.object({ schema: rewriteOutputSchema }),
    });
    await run.onEnd({ usage: result.usage, finishReason: result.finishReason });
    const changed = result.output.items.filter((item) => focus.includes(item.index) && item.text.trim());
    if (changed.length === 0) return problem(502, "Undocx did not return a change. Try again.");
    return Response.json({ items: changed.map((item) => ({ index: item.index, text: item.text.trim() })) });
  } catch (error) {
    await run.onError({ error });
    return problem(502, describeError(error));
  }
}
