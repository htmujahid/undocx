"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { voiceSchema, type VoiceValues } from "~@/lib/context/schemas";
import { useRouter } from "next/navigation";
import { useDeleteVoice, useUpdateVoice } from "../../query";
import { limits } from "~@/lib/context/limits";
import { cn } from "~@/lib/utils";
import { DeleteDialog } from "../../../_components/delete-dialog";
import { DetailHeader } from "../../../_components/detail-header";
import { FormSection } from "../../../_components/empty-pane";
import { SampleRow } from "./sample-row";
import type { SampleData } from "./sample-row";
import { AddSampleDialog } from "./add-sample-dialog";

type VoiceData = {
  id: string;
  name: string;
  notes: string;
  included: number;
  isReady: boolean;
};
export function VoiceEditor({
  voice,
  samples,
}: {
  voice: VoiceData;
  samples: SampleData[];
}) {
  const form = useForm<VoiceValues>({ resolver: zodResolver(voiceSchema), defaultValues: { name: voice.name, notes: voice.notes } });
  const name = useWatch({ control: form.control, name: "name" });
  const router = useRouter();
  const { trigger: update } = useUpdateVoice(voice.id);
  const { trigger: remove } = useDeleteVoice(voice.id);
  const save = form.handleSubmit(async (values) => {
    const result = await update(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });
  const remaining = Math.max(0, limits.samplesMin - voice.included);

  return (
    <>
      <DetailHeader
        backHref="/library/voices"
        eyebrow="Voice"
        title={name.trim() || "Untitled voice"}
        form={form}
        onSave={() => void save()}
      >
        <DeleteDialog
          label="Delete voice"
          title="Delete this voice?"
          description="Its samples are deleted too. Documents that used it keep their text, but lose the link."
          action={async () => {
            await remove();
            router.push("/library/voices");
          }}
        />
      </DetailHeader>

      <div className="mx-auto grid w-full max-w-3xl gap-5 p-4 sm:p-6">
        <FormSection
          title="Voice"
          description="A voice is style only: sentence length, openings, vocabulary. It never adds facts."
        >
          <InputField
            control={form.control}
            name="name"
            label="Name"
            max={limits.name}
            autoFocus={voice.name.startsWith("Untitled")}
            onFocus={(event) => voice.name.startsWith("Untitled") && event.currentTarget.select()}
            placeholder="Plain and warm"
            description="Only you see this. Name it by register, such as plain and warm."
          />
          <TextareaField
            control={form.control}
            name="notes"
            label="Notes (optional)"
            max={limits.voiceNotes}
            autoResize
            className="min-h-20"
            placeholder="Short sentences. Numbers first. Never salesy."
            description="Anything the samples do not show on their own."
          />
        </FormSection>

        <section
          aria-labelledby="samples-title"
          className="grid gap-3 rounded-lg border border-border bg-card p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="samples-title"
                className="m-0 font-serif text-xl font-medium text-foreground"
              >
                Samples
              </h2>
              <p
                className={cn(
                  "m-0 text-sm",
                  voice.isReady ? "text-primary" : "text-muted-foreground",
                )}
              >
                {voice.isReady
                  ? `Ready. ${voice.included} in use, up to ${limits.samplesMax}.`
                  : `${remaining} more ${remaining === 1 ? "sample" : "samples"} needed. Use ${limits.samplesMin} to ${limits.samplesMax}.`}
              </p>
            </div>
            <AddSampleDialog
              voiceId={voice.id}
              isFull={samples.length >= limits.samplesMax}
            />
          </div>
          {samples.length > 0 ? (
            <ul className="m-0 list-none divide-y divide-border p-0">
              {samples.map((sample) => (
                <SampleRow key={sample.id} voiceId={voice.id} sample={sample} />
              ))}
            </ul>
          ) : (
            <p className="m-0 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
              No samples yet. Add three things you wrote and are happy with.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
