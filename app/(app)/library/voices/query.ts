"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { SampleValues, VoiceValues } from "~@/lib/context/schemas";
import {
  addSample,
  createVoice,
  deleteSample,
  deleteVoice,
  listVoices,
  type SampleDraft,
  setSampleIncluded,
  updateVoice,
} from "./actions";

export const voicesKey = "library/voices";

export type VoiceSummary = Awaited<ReturnType<typeof listVoices>>[number];

export function useVoices(initial: VoiceSummary[]) {
  return useSWR(voicesKey, () => listVoices(), {
    fallbackData: initial,
    revalidateOnMount: false,
  }).data;
}

export function useCreateVoice() {
  return useSWRMutation(voicesKey, (_key, { arg }: { arg: { values: VoiceValues; samples: SampleDraft[] } }) => createVoice(arg.values, arg.samples));
}

export function useUpdateVoice(id: string) {
  return useSWRMutation(voicesKey, (_key, { arg }: { arg: VoiceValues }) =>
    updateVoice(id, arg),
  );
}

export function useDeleteVoice(id: string) {
  return useSWRMutation(voicesKey, () => deleteVoice(id));
}

export function useAddSample(voiceId: string) {
  return useSWRMutation(voicesKey, (_key, { arg }: { arg: SampleValues }) =>
    addSample(voiceId, arg),
  );
}

export function useSetSampleIncluded(voiceId: string) {
  return useSWRMutation(
    voicesKey,
    (_key, { arg }: { arg: { sampleId: string; isIncluded: boolean } }) =>
      setSampleIncluded(voiceId, arg.sampleId, arg.isIncluded),
  );
}

export function useDeleteSample(voiceId: string) {
  return useSWRMutation(voicesKey, (_key, { arg }: { arg: string }) =>
    deleteSample(voiceId, arg),
  );
}
