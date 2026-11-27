"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilesIcon, ProfileIcon, RulesIcon, VoiceIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";

const tabs = [
  { href: "/library/profiles", label: "Profiles", icon: ProfileIcon },
  { href: "/library/voices", label: "Voices", icon: VoiceIcon },
  { href: "/library/rules", label: "Rules", icon: RulesIcon },
  { href: "/library/sources", label: "Sources", icon: FilesIcon },
];

export function LibraryTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Library"
      className="flex min-w-0 items-center gap-1 overflow-x-auto"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap no-underline transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
