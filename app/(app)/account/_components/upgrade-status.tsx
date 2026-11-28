"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircleIcon } from "~@/components/ui/icons";

const attempts = 15;

export function UpgradeStatus() {
  const router = useRouter();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (tries >= attempts) return;
    const timer = setTimeout(() => {
      router.refresh();
      setTries((count) => count + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [tries, router]);

  return (
    <p role="status" className="m-0 flex items-center gap-2 rounded-md border border-border bg-background p-3 text-sm text-foreground">
      {tries < attempts ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
      {tries < attempts ? "Payment received. Confirming your upgrade with Polar…" : "Your payment is still being confirmed. Reload this page in a moment."}
    </p>
  );
}
