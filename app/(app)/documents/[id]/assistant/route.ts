import { convertToModelMessages, createUIMessageStreamResponse, generateId, streamText, toUIMessageStream, validateUIMessages, type UIMessage } from "ai";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { callOptions } from "~@/lib/ai/options";
import { authorize, describeError, problem, beginRun } from "~@/lib/ai/route";
import { assistantRequestSchema } from "~@/lib/ai/schemas";
import { assistantInstructions } from "~@/lib/ai/prompts";
import { ensureThread, listThreadMessages, saveThreadMessages } from "~@/lib/db/repository/ai";
import { findDocument } from "~@/lib/db/repository/document";


export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/assistant">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to use the assistant.");
  const { id } = await params;

  const parsed = assistantRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That message could not be read.");

  const doc = await findDocument(userId, id);
  if (!doc) return problem(404, "This document no longer exists.");
  const thread = await ensureThread(userId, id);
  if (!thread) return problem(404, "This document no longer exists.");

  const [context, previous] = await Promise.all([loadContext(userId, doc), listThreadMessages(userId, id)]);

  const userMessage: UIMessage = { id: generateId(), role: "user", parts: [{ type: "text", text: parsed.data.message.text }] };
  const messages = await validateUIMessages({ messages: [...previous, userMessage] });
  const gate = await beginRun({ userId, documentId: doc.id, threadId: thread.id, kind: "assistant", task: "edit" });
  if (gate.denied) return gate.denied;
  const { run } = gate;

  const result = streamText({
    model: getModel(gate.model),
    ...callOptions({ userId, signal: request.signal, effort: "low", seconds: 120 }),
    instructions: assistantInstructions({ ...context, documentText: parsed.data.document.slice(0, gate.limits.documentChars), focus: parsed.data.focus ?? null }),
    messages: await convertToModelMessages(messages.slice(-gate.limits.historyMessages)),
    onEnd: run.onEnd,
    onAbort: run.onAbort,
    onError: run.onError,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: generateId,
      sendReasoning: false,
      onError: describeError,
      onEnd: async ({ messages: updated, responseMessage, outcome }) => {
        await saveThreadMessages(thread.id, outcome.status === "failed" || !responseMessage.parts.some((part) => part.type === "text" && part.text.trim()) ? updated.filter((message) => message.id !== responseMessage.id) : updated);
      },
    }),
  });
}
