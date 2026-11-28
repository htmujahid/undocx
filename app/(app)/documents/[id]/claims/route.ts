import { generateText, Output } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { callOptions } from "~@/lib/ai/options";
import { claimsInstructions, claimsMessage } from "~@/lib/ai/prompts";
import { authorize, describeError, problem, beginRun } from "~@/lib/ai/route";
import { claimsLimits, claimsOutputSchema, claimsRequestSchema } from "~@/lib/ai/schemas";
import { findDocument } from "~@/lib/db/repository/document";

function withinBudget<T extends { text: string }>(blocks: T[], budget: number) {
  const kept: T[] = [];
  for (const block of blocks) {
    budget -= block.text.length;
    if (budget < 0) break;
    kept.push(block);
  }
  return kept;
}

export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/claims">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to check claims.");
  const { id } = await params;

  const parsed = claimsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That request could not be read.");
  const { blocks } = parsed.data;

  const doc = await findDocument(userId, id);
  if (!doc) return problem(404, "This document no longer exists.");

  const context = await loadContext(userId, doc);
  const gate = await beginRun({ userId, documentId: id, kind: "claims", task: "claims" });
  if (gate.denied) return gate.denied;
  const { run } = gate;
  try {
    const result = await generateText({
      model: getModel(gate.model),
      ...callOptions({ userId, signal: request.signal, effort: "medium", seconds: 120 }),
      instructions: claimsInstructions(context),
      prompt: claimsMessage(withinBudget(blocks, gate.limits.documentChars)),
      output: Output.object({ schema: claimsOutputSchema }),
    });
    await run.onEnd({ usage: result.usage, finishReason: result.finishReason });
    const indexes = new Set(blocks.map((block) => block.index));
    const sourceIds = new Set(context.sources.map((source) => source.id));
    const claims = result.output.claims
      .filter((claim) => indexes.has(claim.blockIndex) && claim.text.trim())
      .slice(0, claimsLimits.claims)
      .map((claim) => {
        const sourceId = claim.sourceId && sourceIds.has(claim.sourceId) ? claim.sourceId : null;
        const carriesCitation = sourceId !== null && (blocks.find((block) => block.index === claim.blockIndex)?.text ?? "").includes(`{{cite:${sourceId}}}`);
        const status = sourceId === null ? (claim.status === "cited" || claim.status === "uncited" ? claim.status : "unsourced") : claim.status === "cited" || claim.status === "uncited" ? (carriesCitation ? "cited" : "uncited") : claim.status === "unsupported" && !carriesCitation ? "unsourced" : claim.status;
        return { ...claim, status, sourceId: status === "unsourced" ? null : sourceId, text: claim.text.trim(), note: claim.note.trim() };
      });
    return Response.json({ claims });
  } catch (error) {
    await run.onError({ error });
    return problem(500, describeError(error));
  }
}
