"use client";

import { useRouter } from "next/navigation";
import { ListPane } from "../../_components/list-pane";
import { useCreateProfile, useProfiles, type ProfileSummary } from "../query";

export function ProfilesPane({ initial }: { initial: ProfileSummary[] }) {
  const router = useRouter();
  const profiles = useProfiles(initial);
  const { trigger } = useCreateProfile();
  const items = profiles.map((profile) => {
    const parts = [
      profile.role || profile.organization,
      profile.region, profile.firstLanguage,
    ].filter(Boolean);
    return {
      id: profile.id,
      href: `/library/profiles/${profile.id}`,
      title: profile.name,
      meta: parts.length > 0 ? parts.join(" · ") : "Nothing filled in yet",
      badge: profile.isDefault ? "Default" : undefined,
    };
  });
  return (
    <ListPane
      title="Writer profiles"
      createLabel="New"
      createAction={async () => {
        const result = await trigger();
        if ("error" in result) return result.error;
        router.push(`/library/profiles/${result.id}`);
        return null;
      }}
      items={items}
      emptyText="No profiles yet. Make one per role, client or publication."
    />
  );
}
