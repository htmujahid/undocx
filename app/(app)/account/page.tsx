import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { DocumentsHeader } from "../documents/_components/documents-header";
import { Billing } from "./_components/billing";
import { DeleteAccount } from "./_components/delete-account";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Undocx account and your data.",
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await getCurrentUser();
  const isUpgrading = (await searchParams).upgraded === "1";
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader hasNewButton={false} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
          <div>
            <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Account</p>
            <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">Your account.</h1>
          </div>

          <section aria-label="Profile" className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
            {user.image ? (
              <Image src={user.image} alt="" width={48} height={48} className="size-12 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-medium text-foreground">
                {user.name.slice(0, 1).toUpperCase() || "?"}
              </span>
            )}
            <div className="min-w-0">
              <p className="m-0 truncate text-base font-medium text-foreground">{user.name}</p>
              <p className="m-0 truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="m-0 text-xs text-faint-foreground">Signed in with Google</p>
            </div>
          </section>

          <Suspense fallback={<div role="status" aria-label="Loading plan" className="h-56 rounded-lg border border-border bg-card" />}>
            <Billing userId={user.id} isUpgrading={isUpgrading} />
          </Suspense>

          <DeleteAccount email={user.email} />
        </div>
      </main>
    </div>
  );
}
