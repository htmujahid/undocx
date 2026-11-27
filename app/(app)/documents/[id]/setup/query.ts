"use client";

import useSWRMutation from "swr/mutation";
import { postJson } from "~@/lib/ai/client";
import type { BriefQuestion, OutlineAdvice, OutlineMode } from "~@/lib/documents/brief";
import type { AnswerValues } from "~@/lib/documents/schemas";
import { saveAnswer, setOutline } from "./actions";

export function useGenerateQuestions(id: string) {
  return useSWRMutation(`setup/${id}/questions`, () => postJson<{ questions: BriefQuestion[]; advice: OutlineAdvice }>(`/documents/${id}/setup/questions`));
}

export function useWriteDraft(id: string) {
  return useSWRMutation(`setup/${id}/draft`, () => postJson<{ id: string }>(`/documents/${id}/setup/draft`));
}

export function useSaveAnswer(id: string) {
  return useSWRMutation(`setup/${id}/answers`, (_key, { arg }: { arg: AnswerValues }) => saveAnswer(id, arg));
}

export function useSetOutline(id: string) {
  return useSWRMutation(`setup/${id}/outline`, (_key, { arg }: { arg: OutlineMode }) => setOutline(id, arg));
}
