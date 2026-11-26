import { Suspense } from "react";
import { SignInDialog } from "~@/components/auth/sign-in-dialog";
import { Page } from "~@/(marketing)/_components/frame";
import { SiteFooter } from "~@/(marketing)/_components/site-footer";
import { SiteHeader } from "~@/(marketing)/_components/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <Page>
        {children}
        <SiteFooter />
      </Page>
      <Suspense fallback={null}>
        <SignInDialog />
      </Suspense>
    </>
  );
}
