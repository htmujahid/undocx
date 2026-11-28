"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { voiceSchema, type VoiceValues } from "~@/lib/context/schemas";
import { DetailBody, DetailTop } from "../../_components/detail-header";
import { FormSection } from "../../_components/empty-pane";
import { useCreateVoice } from "../query";
import type { SampleData } from "./sample-row";
import { SamplesSection } from "./samples-section";
import { VoiceFields } from "./voice-fields";

type Draft = SampleData & { content: string };

export function VoiceCreateForm() {
  const router = useRouter();
  const form = useForm<VoiceValues>({ resolver: zodResolver(voiceSchema), defaultValues: { name: "", notes: "" } });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const { trigger: create } = useCreateVoice();
  const save = form.handleSubmit(async (values) => {
    const created = await create({ values, samples: drafts.map(({ title, content, isIncluded }) => ({ title, content, isIncluded })) });
    if ("error" in created) {
      form.setError("root.server", { message: created.error });
      return;
    }
    router.replace(`/library/voices/${created.id}`);
  });
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <DetailBody>
        <DetailTop backHref="/library/voices" backLabel="Voices" form={form} onSave={() => void save()} createLabel="Create voice" />
        <FormSection title="Voice" description="A voice is style only: sentence length, openings, vocabulary. It never adds facts.">
          <VoiceFields control={form.control} autoFocus />
        </FormSection>
        <SamplesSection
          samples={drafts}
          onAdd={async ({ title, content }) => {
            setDrafts((current) => [...current, { id: crypto.randomUUID(), title, content, preview: content.slice(0, 220), wordCount: content.trim().split(/\s+/).filter(Boolean).length, isIncluded: true }]);
            return null;
          }}
          onToggle={(id, isIncluded) => setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, isIncluded } : draft)))}
          onRemove={(id) => setDrafts((current) => current.filter((draft) => draft.id !== id))}
        />
      </DetailBody>
    </div>
  );
}
