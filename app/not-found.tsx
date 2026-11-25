import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { Intro, Lede, Page, Title } from "~@/(marketing)/_components/frame";
import { SiteFooter } from "~@/(marketing)/_components/site-footer";
import { SiteHeader } from "~@/(marketing)/_components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Page>
        <Intro label="Not found" tagline="Nothing here.">
          <div className="flex flex-col gap-6">
            <Title>
              This page is not in <span className="text-primary italic">the outline</span>.
            </Title>
            <Lede>Start again from the first page.</Lede>
            <div>
              <Button variant="primary" render={<Link href="/" />}>
                Back to the start
              </Button>
            </div>
          </div>
        </Intro>
        <SiteFooter />
      </Page>
    </>
  );
}
