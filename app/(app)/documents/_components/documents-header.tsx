import Link from "next/link";
import { UserMenu } from "~@/components/auth/user-menu";
import { Button } from "~@/components/ui/button";
import { FileTextIcon } from "~@/components/ui/icons";
import { newDocumentHref } from "./documents";

export function DocumentsHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 shadow-[inset_0_-1px_0_var(--border)] sm:px-6">
      <Link href="/" className="font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline">
        Undocx<span className="text-primary">.</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" render={<Link href={newDocumentHref} />}>
          <FileTextIcon />
          New document
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
