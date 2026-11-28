import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../../_components/empty-pane";
import { ProfileContent } from "../_components/profile-content";

export const metadata: Metadata = { title: "Writer profile" };

async function Body({ params }: Pick<PageProps<"/library/profiles/[id]">, "params">) {
  const { id } = await params;
  return <ProfileContent id={id} />;
}

export default function ProfilePage({ params }: PageProps<"/library/profiles/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <Body params={params} />
    </Suspense>
  );
}
