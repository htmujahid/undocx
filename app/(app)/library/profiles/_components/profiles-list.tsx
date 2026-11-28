"use client";

import { ProfileMenu } from "./profile-menu";
import { LibraryList } from "../../_components/library-list";
import { useProfiles, type ProfileSummary } from "../query";

export function ProfilesList({ initial }: { initial: ProfileSummary[] }) {
  const profiles = useProfiles(initial);
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
      menu: <ProfileMenu profile={profile} />,
    };
  });
  return (
    <LibraryList
      title="Writer profiles"
      description="Who you are, where you write from, who reads you and the facts to rely on. Pick one on a new document and Undocx stops asking what it already knows."
      createLabel="New profile"
      createHref="/library/profiles/new"
      items={items}
      emptyText="No profiles yet. Make one per role, client or publication."
    />
  );
}
