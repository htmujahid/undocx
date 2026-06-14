"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-32 text-center lg:py-40">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="size-1.5 rounded-full bg-primary" />
          Now in early access
        </div>

        <h1 className="mt-8 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          AI content.
          <br />
          <span className="text-muted-foreground">Every format.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Stop getting walls of text. Undocx writes structured documents (with
          tables, diagrams, code, callouts, and citations) then saves everything
          to a knowledge base you can organize, search, share, and ask questions
          across.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/auth/sign-up" className={buttonVariants({ size: "lg" })}>
            Start for free
          </Link>
          <Link
            href="/auth/sign-in"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-primary/5">
          {/* Theme-aware demo: light video in light mode, dark video in dark mode. */}
          <video
            className="-mt-5.5 block h-auto w-full dark:hidden"
            src="/undocx-light.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <video
            className="-mt-5.5 hidden h-auto w-full dark:block"
            src="/undocx-dark.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </section>
  )
}
