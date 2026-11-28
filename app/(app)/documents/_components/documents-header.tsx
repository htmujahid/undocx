import Link from "next/link";
import { UserMenu } from "~@/components/auth/user-menu";
import { Button } from "~@/components/ui/button";
import { FileTextIcon, AssistantIcon, ProfileIcon } from "~@/components/ui/icons";

export function DocumentsHeader({ hasNewButton = true }: { hasNewButton?: boolean }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 shadow-[inset_0_-1px_0_var(--border)] sm:px-6">
      <Link href="/documents" className="font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline">
        Undocx<span className="text-primary">.</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/chat" prefetch={false} />}>
          <AssistantIcon />
          Ask
        </Button>
        <Button variant="ghost" size="sm" render={<Link href="/library" />}>
          <ProfileIcon />
          Library
        </Button>
        {hasNewButton ? (
          <Button variant="primary" size="sm" render={<Link href="/documents/new" />}>
            <FileTextIcon />
            New document
          </Button>
        ) : null}
        <UserMenu />
      </div>
    </header>
  );
}
