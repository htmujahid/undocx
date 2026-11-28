"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { voiceSchema, type VoiceValues } from "~@/lib/context/schemas";
import { DetailBody, DetailTop } from "../../_components/detail-header";
import { FormSection } from "../../_components/empty-pane";
import { useAddSample, useDeleteSample, useSetSampleIncluded, useUpdateVoice } from "../query";
import type { SampleData } from "./sample-row";
import { SamplesSection } from "./samples-section";
import { VoiceFields } from "./voice-fields";

export function VoiceEditor({ voice, samples }: { voice: { id: string; name: string; notes: string }; samples: SampleData[] }) {
  const form = useForm<VoiceValues>({ resolver: zodResolver(voiceSchema), defaultValues: { name: voice.name, notes: voice.notes } });
  const { trigger: update } = useUpdateVoice(voice.id);
  const { trigger: add } = useAddSample(voice.id);
  const { trigger: setIncluded } = useSetSampleIncluded(voice.id);
  const { trigger: remove } = useDeleteSample(voice.id);
  const save = form.handleSubmit(async (values) => {
    const result = await update(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <DetailBody>
        <DetailTop backHref="/library/voices" backLabel="Voices" form={form} onSave={() => void save()} />
        <FormSection title="Voice" description="A voice is style only: sentence length, openings, vocabulary. It never adds facts.">
          <VoiceFields control={form.control} />
        </FormSection>
        <SamplesSection
          samples={samples}
          onAdd={async (values) => (await add(values))?.error ?? null}
          onToggle={(sampleId, isIncluded) => setIncluded({ sampleId, isIncluded })}
          onRemove={(sampleId) => remove(sampleId)}
        />
      </DetailBody>
    </div>
  );
}
