"use client"

import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-20 text-center text-primary-foreground sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start building your knowledge base
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/70">
              Generate structured documents, organize everything in one place,
              edit with AI, and ask questions across it all. Free during early
              access.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-primary transition-colors hover:bg-white/90"
              >
                Get started for free
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex h-10 items-center justify-center rounded-md border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
