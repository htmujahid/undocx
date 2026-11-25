import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { ModeToggle } from "~@/components/ui/mode-toggle";
import { navLinks, startHref } from "./links";
import { railColumns } from "./frame";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 h-nav bg-background shadow-[inset_0_-1px_0_var(--border)]">
      <nav
        aria-label="Primary"
        className={`mx-auto grid h-full max-w-page grid-cols-[auto_1fr_auto] items-stretch border-x border-border max-lg:border-x-0 ${railColumns} lg:grid-cols-[16rem_minmax(0,1fr)_auto]`}
      >
        <Link
          href="/"
          className="flex items-center px-gutter font-serif text-2xl leading-none font-medium tracking-tight text-foreground lg:border-r lg:border-border"
        >
          Undocx<span className="text-primary">.</span>
        </Link>
        <div className="flex items-center px-gutter">
          <NavLinks links={navLinks} />
        </div>
        <div className="flex items-center justify-end gap-2 px-gutter">
          <ModeToggle />
          <Button variant="primary" className="max-lg:hidden" render={<Link href={startHref} />}>
            Start writing free
          </Button>
          <MobileMenu links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
