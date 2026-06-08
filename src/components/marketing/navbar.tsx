import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-primary-foreground"
            >
              <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
              <path d="M19 14l-3 3 3 3" />
              <path d="m22 14-3 3 3 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Tarteeb AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/auth/sign-in"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign in
          </Link>
          <Link
            to="/auth/sign-up"
            className={buttonVariants({ size: "sm" })}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  )
}
