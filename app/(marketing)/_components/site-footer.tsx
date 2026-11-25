import Link from "next/link";
import { railColumns } from "./frame";

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className={`mt-auto grid grid-cols-1 border-t border-border text-sm text-muted-foreground ${railColumns}`}>
      <p className="m-0 flex items-center px-gutter py-5 font-serif text-xl font-medium tracking-tight text-foreground">
        Undocx<span className="text-primary">.</span>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-gutter py-5">
        <nav aria-label="Legal">
          <ul className="m-0 flex list-none gap-6 p-0">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-foreground underline-offset-[0.18em] hover:text-primary-deep hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="m-0">© 2026 Undocx</p>
      </div>
    </footer>
  );
}
