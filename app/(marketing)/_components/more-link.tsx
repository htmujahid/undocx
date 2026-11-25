import Link from "next/link";
import type { ReactNode } from "react";

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-[0.3em] hover:text-primary-deep hover:decoration-primary"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
