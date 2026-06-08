import { Link } from "@tanstack/react-router"

const PRODUCT_LINKS = [
  { label: "About", to: "/about" },
] as const

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
] as const

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex w-fit items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
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
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              AI content that adapts its format to your question — prose,
              tables, flowcharts, flashcards, and more.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tarteeb AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
