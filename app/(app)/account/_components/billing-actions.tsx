"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { authClient } from "~@/lib/auth/client";

export function BillingAction({ kind, children }: { kind: "upgrade" | "manage"; children: React.ReactNode }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function open() {
    setPending(true);
    setFailed(false);
    const { error } = kind === "upgrade" ? await authClient.checkout({ slug: "pro" }) : await authClient.customer.portal();
    if (error) {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="grid justify-items-start gap-2">
      <Button variant={kind === "upgrade" ? "primary" : "secondary"} disabled={pending} onClick={() => void open()}>
        {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
        {children}
      </Button>
      {failed ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          Billing could not be opened. Try again in a moment.
        </p>
      ) : null}
    </div>
  );
}
