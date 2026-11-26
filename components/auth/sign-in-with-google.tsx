"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { GoogleIcon } from "~@/components/ui/icons";
import { signIn } from "~@/lib/auth/client";

export function SignInWithGoogle({ next }: { next?: string }) {
  const callbackURL = next && next.startsWith("/") && !next.startsWith("//") ? next : "/documents";
  const [failed, setFailed] = useState(false);

  return (
    <div className="grid gap-3">
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={async () => {
          setFailed(false);
          const { error } = await signIn.social({ provider: "google", callbackURL, errorCallbackURL: "/?login&error=google" });
          if (error) setFailed(true);
        }}
      >
        <GoogleIcon weight="bold" />
        Continue with Google
      </Button>
      {failed ? (
        <p role="alert" className="m-0 text-sm text-destructive">
          Could not start Google sign-in. Please try again in a moment.
        </p>
      ) : null}
    </div>
  );
}
