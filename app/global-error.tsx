"use client"

import { useEffect } from "react"

import "./globals.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="space-y-1.5">
            <h2 className="text-lg font-medium tracking-tight">
              Something went wrong
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              A critical error occurred and the application could not recover.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/70 tabular-nums">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={() => unstable_retry()}
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
