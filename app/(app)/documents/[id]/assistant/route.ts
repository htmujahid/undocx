import { convertToModelMessages, createUIMessageStreamResponse, generateId, streamText, toUIMessageStream, validateUIMessages, type UIMessage } from "ai";
import { z } from "zod";
import { loadContext } from "~@/lib/ai/context";
import { getModel } from "~@/lib/ai/model";
import { authorize, describeError, problem, trackRun } from "~@/lib/ai/route";
import { assistantMessageSchema } from "~@/lib/ai/schemas";
import { assistantInstructions } from "~@/lib/ai/prompts";
import { ensureThread, listThreadMessages, saveThreadMessages } from "~@/lib/db/repository/ai";
import { findDocument } from "~@/lib/db/repository/document";

const MAX_HISTORY = 30;

const requestSchema = z.object({
  message: assistantMessageSchema,
  document: z.string().max(200_000),
});

export async function POST(request: Request, { params }: RouteContext<"/documents/[id]/assistant">) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to use the assistant.");
  const { id } = await params;

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That message could not be read.");

  const doc = await findDocument(userId, id);
  if (!doc) return problem(404, "This document no longer exists.");
  const thread = await ensureThread(userId, id);
  if (!thread) return problem(404, "This document no longer exists.");

  const [context, previous] = await Promise.all([loadContext(userId, doc), listThreadMessages(userId, id)]);

  const userMessage: UIMessage = { id: generateId(), role: "user", parts: [{ type: "text", text: parsed.data.message.text }] };
  const messages = await validateUIMessages({ messages: [...previous, userMessage] });
  const run = trackRun({ userId, documentId: doc.id, threadId: thread.id, kind: "assistant" });

  const result = streamText({
    model: getModel(),
    instructions: assistantInstructions({ ...context, documentText: parsed.data.document }),
    messages: await convertToModelMessages(messages.slice(-MAX_HISTORY)),
    onEnd: run.onEnd,
    onError: run.onError,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: generateId,
      onError: describeError,
      onEnd: async ({ messages: updated, responseMessage, outcome, isAborted }) => {
        if (isAborted) return;
        await saveThreadMessages(thread.id, outcome.status === "failed" ? updated.filter((message) => message.id !== responseMessage.id) : updated);
      },
    }),
  });
}
