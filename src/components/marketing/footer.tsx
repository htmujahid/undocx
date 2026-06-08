import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2.5">
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

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tarteeb AI. All rights reserved.
          </p>

          <nav className="flex gap-5 text-xs text-muted-foreground">
            <Link
              to="/auth/sign-in"
              className="hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/auth/sign-up"
              className="hover:text-foreground transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
