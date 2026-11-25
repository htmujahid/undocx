"use client";

import { Geist, Newsreader } from "next/font/google";
import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], display: "swap", variable: "--font-newsreader" });
const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`${newsreader.variable} ${geist.variable}`}>
      <body>
        <main className="flex min-h-dvh flex-col items-start justify-center gap-6 bg-background px-gutter font-sans text-foreground">
          <p className="m-0 font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">Something broke</p>
          <h1 className="m-0 max-w-[20ch] font-serif text-display font-normal text-balance">
            Undocx could not <span className="text-primary italic">load</span>.
          </h1>
          <p className="m-0 max-w-measure text-lg leading-[1.55] text-muted-foreground">
            The page failed before it could draw anything. Trying again usually works.
            {error.digest ? ` Reference ${error.digest}.` : ""}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-primary-deep">
              Try again
            </button>
            <Link href="/" className="inline-flex h-11 items-center rounded-md border border-input bg-card px-5 text-base font-medium text-foreground hover:bg-muted">
              Back to the start
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
