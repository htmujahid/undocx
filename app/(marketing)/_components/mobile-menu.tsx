"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "~@/components/ui/drawer";
import { MenuIcon, XIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { startHref } from "./links";

export function MobileMenu({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <Drawer side="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger aria-label="Open menu" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}>
        <MenuIcon />
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <div className="flex min-h-nav items-center justify-between border-b border-border px-5">
          <DrawerTitle>
            Undocx<span className="text-primary">.</span>
          </DrawerTitle>
          <DrawerClose aria-label="Close menu" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DrawerClose>
        </div>
        <DrawerDescription className="sr-only">Pages of this site.</DrawerDescription>
        <nav aria-label="Site" className="flex flex-col gap-1 px-3 py-4">
          {links.map((link) => {
            const isCurrent = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent ? "page" : undefined}
                onClick={close}
                className={cn("rounded-md px-2 py-2.5 text-base text-foreground hover:bg-muted", isCurrent && "font-medium text-primary-deep")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 pt-2">
          <Button variant="primary" className="w-full" onClick={close} render={<Link href={startHref} />}>
            Start writing free
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
