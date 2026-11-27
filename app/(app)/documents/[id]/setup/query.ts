"use client";

import useSWRMutation from "swr/mutation";
import type { BriefQuestion, OutlineAdvice, OutlineMode } from "~@/lib/documents/brief";
import type { AnswerValues } from "~@/lib/documents/schemas";
import { saveAnswer, setOutline } from "./actions";

async function post<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "POST" });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !body) throw new Error(body?.error ?? "Something went wrong. Try again.");
  return body;
}

export function useGenerateQuestions(id: string) {
  return useSWRMutation(`setup/${id}/questions`, () => post<{ questions: BriefQuestion[]; advice: OutlineAdvice }>(`/documents/${id}/setup/questions`));
}

export function useWriteDraft(id: string) {
  return useSWRMutation(`setup/${id}/draft`, () => post<{ id: string }>(`/documents/${id}/setup/draft`));
}

export function useSaveAnswer(id: string) {
  return useSWRMutation(`setup/${id}/answers`, (_key, { arg }: { arg: AnswerValues }) => saveAnswer(id, arg));
}

export function useSetOutline(id: string) {
  return useSWRMutation(`setup/${id}/outline`, (_key, { arg }: { arg: OutlineMode }) => setOutline(id, arg));
}
