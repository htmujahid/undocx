"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import { limits, type FormState } from "~@/lib/context/limits";
import { profileSchema, type ProfileValues } from "~@/lib/context/schemas";
import {
  countProfiles,
  insertProfile,
  listProfiles as listProfilesFor,
  makeDefaultProfile,
  removeProfile,
  unsetDefaultProfile,
  updateProfileFields,
} from "~@/lib/db/repository/profile";

function refresh() {
  revalidatePath("/library", "layout");
}

export async function listProfiles() {
  return listProfilesFor(await requireUserId());
}

export async function createProfile() {
  const userId = await requireUserId();
  const total = await countProfiles(userId);
  if (total >= limits.perUser) return null;
  const id = await insertProfile(userId, total === 0);
  refresh();
  return id;
}

export async function updateProfile(id: string, values: ProfileValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, audienceLevel, ...rest } = parsed.data;
  const isUpdated = await updateProfileFields(userId, id, {
    ...rest,
    name,
    audienceLevel,
    region: rest.region || null,
    firstLanguage: rest.firstLanguage || null,
    writingLanguage: rest.writingLanguage || null,
    currency: rest.currency || null,
    units: rest.units || null,
    dateFormat: rest.dateFormat || null,
  });
  if (!isUpdated) return { error: "This profile no longer exists." };
  refresh();
  return { saved: true };
}

export async function setProfileDefault(id: string, isDefault: boolean) {
  const userId = await requireUserId();
  if (isDefault) await makeDefaultProfile(userId, id);
  else await unsetDefaultProfile(userId, id);
  refresh();
}

export async function deleteProfile(id: string) {
  await removeProfile(await requireUserId(), id);
  refresh();
}
