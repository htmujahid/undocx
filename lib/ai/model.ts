import "server-only";

import { openai } from "@ai-sdk/openai";
import type { PlanId } from "~@/lib/billing/plans";

export type Task = "questions" | "draft" | "edit" | "claims";

const routes: Record<Task, Record<PlanId, string>> = {
  questions: { free: "gpt-5.4-nano", pro: "gpt-5.4-nano" },
  draft: { free: "gpt-5.4-mini", pro: "gpt-5.4" },
  edit: { free: "gpt-5.4-mini", pro: "gpt-5.4-mini" },
  claims: { free: "gpt-5.4-mini", pro: "gpt-5.4" },
};

export function modelFor(task: Task, plan: PlanId) {
  return process.env.OPENAI_MODEL || routes[task][plan];
}

export function getModel(id: string) {
  return openai(id);
}
