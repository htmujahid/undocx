import { Suspense } from "react";
import { AuthGate } from "~@/components/auth/auth-gate";
import { LoaderCircleIcon } from "~@/components/ui/icons";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="h-dvh overflow-hidden bg-background font-sans text-foreground">
      <Suspense fallback={<AppLoading />}>
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </div>
  );
}

function AppLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex h-full items-center justify-center text-muted-foreground">
      <LoaderCircleIcon className="size-5 animate-spin" />
    </div>
  );
}
