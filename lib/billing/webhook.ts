import "server-only";

import type { webhooks } from "@polar-sh/sdk/2026-10";
import { upsertSubscription } from "~@/lib/db/repository/billing";

const foreignKeyViolation = "23503";

export async function syncSubscription(payload: webhooks.WebhookPayload) {
  if (!payload.type.startsWith("subscription.") || payload.type === "subscription.migrated") return;
  const data = (payload as webhooks.WebhookSubscriptionActivePayload).data;
  const userId = data.customer.external_id;
  if (!userId) return;
  try {
    await upsertSubscription({
      id: data.id,
      userId,
      productId: data.product_id,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
      endsAt: data.ends_at ? new Date(data.ends_at) : null,
      endedAt: data.ended_at ? new Date(data.ended_at) : null,
      modifiedAt: new Date(data.modified_at ?? data.created_at),
    });
  } catch (error) {
    if ((error as { cause?: { code?: string } }).cause?.code === foreignKeyViolation) return;
    throw error;
  }
}
