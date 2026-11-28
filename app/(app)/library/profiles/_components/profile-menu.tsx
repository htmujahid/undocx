"use client";

import { CheckIcon } from "~@/components/ui/icons";
import { LibraryItemMenu } from "../../_components/library-item-menu";
import { useDeleteProfile, useSetProfileDefault } from "../query";

export function ProfileMenu({ profile }: { profile: { id: string; name: string; isDefault: boolean } }) {
  const { trigger: setDefault } = useSetProfileDefault(profile.id);
  const { trigger: remove } = useDeleteProfile(profile.id);
  return (
    <LibraryItemMenu
      label={profile.name}
      extra={[{ value: "default", label: profile.isDefault ? "Remove as default" : "Make default", icon: <CheckIcon />, run: () => setDefault(!profile.isDefault) }]}
      deleteTitle="Delete this profile?"
      deleteDescription="Documents that used it keep their text, but lose the link."
      onDelete={() => remove()}
    />
  );
}
