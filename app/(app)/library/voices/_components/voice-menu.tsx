"use client";

import { LibraryItemMenu } from "../../_components/library-item-menu";
import { useDeleteVoice } from "../query";

export function VoiceMenu({ voice }: { voice: { id: string; name: string } }) {
  const { trigger: remove } = useDeleteVoice(voice.id);
  return <LibraryItemMenu label={voice.name} deleteTitle="Delete this voice?" deleteDescription="Its samples are deleted too. Documents that used it keep their text, but lose the link." onDelete={() => remove()} />;
}
