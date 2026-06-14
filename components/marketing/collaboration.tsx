"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

const CAPABILITIES = [
  {
    title: "Multiple workspaces",
    description:
      "Keep separate spaces for personal projects, a team, or a client, each with its own documents and members.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Roles & invitations",
    description:
      "Invite teammates by email as editors or viewers. Roles control exactly who can change a document and who can only read it.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    ),
  },
  {
    title: "Share a doc or a workspace",
    description:
      "Share an entire workspace with your team, or hand off access to a single document without exposing everything else.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
      </svg>
    ),
  },
  {
    title: "Public links",
    description:
      "Flip on public access to get a read-only link anyone can open (no account required). Turn it off to make it private again.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
]

export function Collaboration() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Collaboration
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A knowledge base your whole team can build on
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Renderical isn&apos;t just for one person. Spin up workspaces,
              invite collaborators with the right level of access, and keep
              everyone working from the same structured, searchable source of
              truth, with activity notifications so nothing slips by.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/sign-up"
                className={buttonVariants({ size: "lg" })}
              >
                Start a workspace
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {c.icon}
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
