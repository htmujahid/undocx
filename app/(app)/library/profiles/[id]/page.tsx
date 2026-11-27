import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findProfile } from "~@/lib/db/repository/profile";
import { PaneFallback } from "../../_components/empty-pane";
import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = { title: "Writer profile" };

async function ProfileContent({
  params,
}: {
  params: PageProps<"/library/profiles/[id]">["params"];
}) {
  const { id } = await params;
  const profile = await findProfile((await getCurrentUser()).id, id);
  if (!profile) notFound();
  return <ProfileForm key={profile.id} profile={profile} />;
}

export default function ProfilePage(
  props: PageProps<"/library/profiles/[id]">,
) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <ProfileContent params={props.params} />
    </Suspense>
  );
}
