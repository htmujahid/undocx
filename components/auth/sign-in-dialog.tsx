"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { XIcon } from "~@/components/ui/icons";
import { SignInWithGoogle } from "./sign-in-with-google";

export const LOGIN_PARAM = "login";

export function SignInDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const settled = useAfterHydration();
  const open = settled && searchParams.has(LOGIN_PARAM);
  const next = searchParams.get("next") ?? undefined;
  const error = searchParams.get("error");

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete(LOGIN_PARAM);
    params.delete("next");
    params.delete("error");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4 p-5 pb-0">
          <div className="grid gap-1">
            <DialogTitle>Sign in to Undocx</DialogTitle>
            <DialogDescription>Use your Google account. We only ask for your name, email and avatar.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <div className="grid gap-4 p-5">
          {error ? (
            <p role="alert" className="m-0 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Google sign-in did not complete. Please try again.
            </p>
          ) : null}
          <SignInWithGoogle next={next} />
          <p className="m-0 text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useAfterHydration() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (typeof requestIdleCallback !== "function") {
      const id = setTimeout(() => setSettled(true), 0);
      return () => clearTimeout(id);
    }
    const id = requestIdleCallback(() => setSettled(true), { timeout: 1000 });
    return () => cancelIdleCallback(id);
  }, []);
  return settled;
}
