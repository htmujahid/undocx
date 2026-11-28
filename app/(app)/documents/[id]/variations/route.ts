import { generateText, Output } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { editMessage, variationsInstructions } from "~@/lib/ai/prompts";
import { callOptions } from "~@/lib/ai/options";
import { authorize, describeError, problem, beginRun } from "~@/lib/ai/route";
import { variationsOutputSchema, variationsRequestSchema } from "~@/lib/ai/schemas";
import { findDocument } from "~@/lib/db/repository/document";

export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/variations">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to edit with Undocx.");
  const { id } = await params;

  const parsed = variationsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That request could not be read.");
  const { instruction, item, context } = parsed.data;
  if (item.locked || item.kind === "other") return problem(422, "This block is locked or cannot be rewritten.");

  const doc = await findDocument(userId, id);
  if (!doc) return problem(404, "This document no longer exists.");

  const gate = await beginRun({ userId, documentId: id, kind: "variations", task: "edit" });
  if (gate.denied) return gate.denied;
  const { run } = gate;
  try {
    const result = await generateText({
      model: getModel(gate.model),
      ...callOptions({ userId, signal: request.signal, effort: "low", seconds: 90 }),
      instructions: variationsInstructions({ ...(await loadContext(userId, doc)), instruction }),
      prompt: editMessage({ items: [item], focus: [item.index], context }),
      output: Output.object({ schema: variationsOutputSchema }),
    });
    await run.onEnd({ usage: result.usage, finishReason: result.finishReason });
    const variations = [...new Set(result.output.variations.map((text) => text.trim()).filter(Boolean))].slice(0, 3);
    if (variations.length === 0) return problem(500, "Undocx did not return any versions. Try again.");
    return Response.json({ variations });
  } catch (error) {
    await run.onError({ error });
    return problem(500, describeError(error));
  }
}
