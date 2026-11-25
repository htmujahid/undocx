"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~@/lib/utils";

export function NavLinks({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="m-0 hidden list-none gap-6 p-0 lg:flex">
      {links.map((link) => {
        const isCurrent = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "text-sm text-foreground underline-offset-[0.4em] hover:text-primary-deep hover:underline",
                isCurrent && "underline decoration-primary decoration-2",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
