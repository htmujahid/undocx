import Link from "next/link";
import { UserMenu } from "~@/components/auth/user-menu";
import { LibraryTabs } from "./library-tabs";

export function LibraryHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 px-4 shadow-[inset_0_-1px_0_var(--border)] sm:gap-6 sm:px-6">
      <Link href="/documents" className="font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline">
        Undocx<span className="text-primary">.</span>
      </Link>
      <LibraryTabs />
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
