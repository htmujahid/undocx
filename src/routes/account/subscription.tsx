import { createFileRoute } from "@tanstack/react-router"

import { SubscriptionPage } from "@/components/account/subscription-page"

export const Route = createFileRoute("/account/subscription")({
  component: SubscriptionRoute,
})

function SubscriptionRoute() {
  return <SubscriptionPage />
}
