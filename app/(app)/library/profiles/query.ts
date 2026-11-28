"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { ProfileValues } from "~@/lib/context/schemas";
import {
  createProfile,
  deleteProfile,
  listProfiles,
  setProfileDefault,
  updateProfile,
} from "./actions";

export const profilesKey = "library/profiles";

export type ProfileSummary = Awaited<ReturnType<typeof listProfiles>>[number];

export function useProfiles(initial: ProfileSummary[]) {
  return useSWR(profilesKey, () => listProfiles(), {
    fallbackData: initial,
    revalidateOnMount: false,
  }).data;
}

export function useCreateProfile() {
  return useSWRMutation(profilesKey, (_key, { arg }: { arg: ProfileValues }) => createProfile(arg));
}

export function useUpdateProfile(id: string) {
  return useSWRMutation(profilesKey, (_key, { arg }: { arg: ProfileValues }) =>
    updateProfile(id, arg),
  );
}

export function useSetProfileDefault(id: string) {
  return useSWRMutation(profilesKey, (_key, { arg }: { arg: boolean }) =>
    setProfileDefault(id, arg),
  );
}

export function useDeleteProfile(id: string) {
  return useSWRMutation(profilesKey, () => deleteProfile(id));
}
