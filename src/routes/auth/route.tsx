import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ context, location }) => {
    if (
      context.user &&
      location.pathname !== "/auth/update-password" &&
      location.pathname !== "/auth/two-factor"
    )
      throw redirect({ to: "/home" })
  },
  component: AuthLayout,
})

const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
      >
        <rect width="8" height="5" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    ),
    label: "Adaptive content formats",
    description: "AI picks the best layout for every query",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
      >
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </svg>
    ),
    label: "Smart organization",
    description: "Folders, tags, and collections for every piece",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
      >
        <path d="M12 20h9" />
        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      </svg>
    ),
    label: "AI-assisted editing",
    description: "Select any content and refine it with a prompt",
  },
]

function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-foreground lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col p-10 text-background">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
                <path d="M19 14l-3 3 3 3" />
                <path d="m22 14-3 3 3 3" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Tarteeb AI
            </span>
          </Link>

          <div className="flex flex-1 items-center">
            <div className="space-y-7">
              <div className="space-y-3">
                <p className="text-[2rem] font-semibold leading-tight tracking-tight">
                  AI content. Every format.
                </p>
                <p className="text-sm leading-relaxed text-white/50">
                  Generate, organize, and edit AI content in adaptive layout
                  formats. From flowcharts to flashcards, all in one knowledge
                  base.
                </p>
              </div>

              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {f.label}
                      </p>
                      <p className="text-xs text-white/40">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/25">
            &copy; {new Date().getFullYear()} Tarteeb AI. All rights reserved.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-primary-foreground"
              >
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
                <path d="M19 14l-3 3 3 3" />
                <path d="m22 14-3 3 3 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Tarteeb AI</span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
