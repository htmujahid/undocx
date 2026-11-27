"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "~@/components/auth/user-provider";
import { buttonVariants } from "~@/components/ui/button";
import { LoaderCircleIcon, ProfileIcon, SignOutIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
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

export function UserMenu({ className }: { className?: string }) {
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
      <MenuTrigger aria-label="Account" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full p-0", className)}>
        {user.image ? (
          <Image src={user.image} alt="" width={28} height={28} className="size-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            {initials(user.name) || "?"}
          </span>
        )}
      </MenuTrigger>
      <MenuContent align="end" className="min-w-56">
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
