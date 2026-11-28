"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "~@/components/auth/user-provider";
import { buttonVariants } from "~@/components/ui/button";
import { ChevronUpDownIcon, LoaderCircleIcon, ProfileIcon, SignOutIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { SidebarMenuButton } from "~@/components/ui/sidebar";
import { signOut } from "~@/lib/auth/client";
import { cn } from "~@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar({ user }: { user: { name: string; image: string | null } }) {
  return user.image ? (
    <Image src={user.image} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" referrerPolicy="no-referrer" />
  ) : (
    <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
      {initials(user.name) || "?"}
    </span>
  );
}

export function UserMenu({ className, variant = "avatar" }: { className?: string; variant?: "avatar" | "sidebar" }) {
  const user = useUser();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: () => setSigningOut(false),
      },
    });
  }

  return (
    <Menu
      onAction={(key) => {
        if (key === "sign-out") void handleSignOut();
        if (key === "account") router.push("/account");
      }}
    >
      {variant === "sidebar" ? (
        <MenuTrigger render={<SidebarMenuButton size="lg" tooltip="Account" aria-label="Account" className="data-popup-open:bg-sidebar-accent" />}>
          <Avatar user={user} />
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
          <ChevronUpDownIcon className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </MenuTrigger>
      ) : (
        <MenuTrigger aria-label="Account" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full p-0", className)}>
          <Avatar user={user} />
        </MenuTrigger>
      )}
      <MenuContent side={variant === "sidebar" ? "top" : "bottom"} align={variant === "sidebar" ? "start" : "end"} className="min-w-56">
        <MenuGroup>
          <MenuGroupLabel>Signed in as</MenuGroupLabel>
          <div className="px-2 pb-2">
            <p className="m-0 truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="m-0 truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem value="account" icon={<ProfileIcon />}>
          Account
        </MenuItem>
        <MenuItem value="sign-out" icon={signingOut ? <LoaderCircleIcon className="animate-spin" /> : <SignOutIcon />} disabled={signingOut}>
          Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
