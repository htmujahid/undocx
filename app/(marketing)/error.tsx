"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "~@/components/ui/button";
import { Intro, Lede, Title } from "./_components/frame";

export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Intro label="Something broke" tagline={error.digest ? `Reference ${error.digest}` : "On our side, not yours."}>
      <div className="flex flex-col gap-6">
        <Title>
          This paragraph did not <span className="text-primary italic">regenerate</span>.
        </Title>
        <Lede>The page hit an error while loading. Trying again usually works. If it does not, the home page always does.</Lede>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button render={<Link href="/" />}>Back to the start</Button>
        </div>
      </div>
    </Intro>
  );
}
