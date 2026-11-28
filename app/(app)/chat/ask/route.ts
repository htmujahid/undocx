import { convertToModelMessages, createUIMessageStreamResponse, generateId, generateText, streamText, toUIMessageStream, validateUIMessages, type UIMessage } from "ai";
import { getModel, modelFor } from "~@/lib/ai/model";
import { callOptions } from "~@/lib/ai/options";
import { authorize, beginRun, describeError, problem } from "~@/lib/ai/route";
import { chatInstructions, standaloneInstructions } from "~@/lib/chat/prompts";
import { chatLimits, chatRequestSchema, type ChatMetadata, type ChatSource } from "~@/lib/chat/schemas";
import { ensureChatThread, listChatMessages, saveChatMessages } from "~@/lib/db/repository/chat";
import { searchChunks } from "~@/lib/db/repository/retrieval";
import { embedTexts } from "~@/lib/retrieval/embed";
import { refreshIndex } from "~@/lib/retrieval/indexer";

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export async function POST(request: Request) {
  const userId = await authorize();
  if (!userId) return problem(401, "Sign in to search your documents.");

  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "That question could not be read.");
  const { message, threadId, documentId } = parsed.data;

  const gate = await beginRun({ userId, kind: "chat", task: "chat", documentId: documentId ?? undefined });
  if (gate.denied) return gate.denied;
  const { run } = gate;

  try {
    const thread = await ensureChatThread(userId, threadId, message.text.replace(/\s+/g, " ").slice(0, chatLimits.title));
    if (!thread) {
      await run.onAbort();
      return problem(404, "This chat no longer exists.");
    }
    const previous = await listChatMessages(thread.id);
    let query = message.text;
    if (previous.length > 0) {
      const recent = previous.slice(-4).map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${textOf(item).slice(0, 600)}`).join("\n");
      const rewritten = await generateText({
        model: getModel(modelFor("questions", gate.plan)),
        ...callOptions({ userId, signal: request.signal, effort: "low", seconds: 20 }),
        instructions: standaloneInstructions(),
        prompt: `${recent}\nUser: ${message.text}`,
      }).catch(() => null);
      query = rewritten?.text.trim().slice(0, 500) || message.text;
    }

    await refreshIndex(userId, { budgetMs: 15_000 });
    const [vector] = await embedTexts([query], request.signal);
    const hits = await searchChunks(userId, { vector, query, documentId: documentId ?? undefined, limit: chatLimits.excerpts });

    let budget = gate.limits.documentChars;
    const sources: ChatSource[] = [];
    for (const hit of hits) {
      if (hit.similarity < chatLimits.minSimilarity && !hit.keyword) continue;
      if (budget <= 0) break;
      const text = hit.text.slice(0, budget);
      budget -= text.length;
      sources.push({ n: sources.length + 1, documentId: hit.documentId, title: hit.title, section: hit.headingPath, text });
    }

    const userMessage: UIMessage = { id: generateId(), role: "user", parts: [{ type: "text", text: message.text }] };
    const messages = await validateUIMessages({ messages: [...previous, userMessage] });

    const result = streamText({
      model: getModel(gate.model),
      ...callOptions({ userId, signal: request.signal, effort: "low", seconds: 90 }),
      instructions: chatInstructions(sources),
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
        messageMetadata: ({ part }): ChatMetadata | undefined => (part.type === "start" ? { sources } : undefined),
        onError: describeError,
        onEnd: async ({ messages: updated, responseMessage, outcome }) => {
          await saveChatMessages(thread.id, outcome.status === "failed" || !responseMessage.parts.some((part) => part.type === "text" && part.text.trim()) ? updated.filter((item) => item.id !== responseMessage.id) : updated);
        },
      }),
    });
  } catch (error) {
    await run.onError({ error });
    return problem(500, describeError(error));
  }
}
