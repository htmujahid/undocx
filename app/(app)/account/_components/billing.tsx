import { getEntitlement, usageSince } from "~@/lib/db/repository/billing";
import { percentUsed, plans } from "~@/lib/billing/plans";
import { BillingAction } from "./billing-actions";

const dateFormat = new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export async function Billing({ userId }: { userId: string }) {
  const { plan, limits, subscription, window } = await getEntitlement(userId);
  const used = await usageSince(userId, window.start);
  const percent = percentUsed(used.micros, limits.allowanceMicros);
  const canceling = subscription?.cancelAtPeriodEnd ?? false;
  const pastDue = subscription?.status === "past_due";

  return (
    <section aria-labelledby="billing-title" className="grid gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="billing-title" className="m-0 font-serif text-xl font-medium text-foreground">
          Plan
        </h2>
        <p className="m-0 text-sm text-foreground">
          {plans[plan].name}
          {plan === "pro" ? ` · $${plans.pro.priceUsd} per month` : ""}
        </p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-foreground">AI usage this period</span>
          <span className="text-muted-foreground">{percent}% used</span>
        </div>
        <div role="progressbar" aria-label="AI usage this period" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        <p className="m-0 text-xs text-muted-foreground">Resets on {dateFormat.format(window.end)}.</p>
      </div>

      {subscription ? (
        <p className="m-0 text-sm leading-normal text-muted-foreground">
          {pastDue
            ? "Your last payment did not go through. Update your payment method to keep Pro."
            : canceling
              ? `Pro is canceled and stays active until ${dateFormat.format(subscription.currentPeriodEnd)}. After that you are on the Free plan.`
              : `Pro renews on ${dateFormat.format(subscription.currentPeriodEnd)}.`}
        </p>
      ) : (
        <p className="m-0 text-sm leading-normal text-muted-foreground">
          Pro gives you {plans.pro.limits.documents} documents, a larger AI allowance and the strongest model for first drafts and claim checks.
        </p>
      )}

      <div>{subscription ? <BillingAction kind="manage">Manage billing</BillingAction> : <BillingAction kind="upgrade">Upgrade to Pro</BillingAction>}</div>
    </section>
  );
}
