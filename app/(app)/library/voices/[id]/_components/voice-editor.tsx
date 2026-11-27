"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { sampleSchema, voiceSchema, type SampleValues, type VoiceValues } from "~@/lib/context/schemas";
import { Button, buttonVariants } from "~@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~@/components/ui/dialog";
import {
  LoaderCircleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "~@/components/ui/icons";
import { Switch } from "~@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  useAddSample,
  useDeleteSample,
  useDeleteVoice,
  useSetSampleIncluded,
  useUpdateVoice,
} from "../../query";
import { countWords, limits } from "~@/lib/context/limits";
import { cn } from "~@/lib/utils";
import { DeleteDialog } from "../../../_components/delete-dialog";
import { DetailHeader } from "../../../_components/detail-header";
import { FormSection } from "../../../_components/empty-pane";

type VoiceData = {
  id: string;
  name: string;
  notes: string;
  included: number;
  isReady: boolean;
};
type SampleData = {
  id: string;
  title: string;
  preview: string;
  wordCount: number;
  isIncluded: boolean;
};

function SampleRow({
  voiceId,
  sample,
}: {
  voiceId: string;
  sample: SampleData;
}) {
  const { trigger: setIncluded } = useSetSampleIncluded(voiceId);
  const { trigger: remove } = useDeleteSample(voiceId);
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <li className={cn("grid gap-1.5 py-3", !sample.isIncluded && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-medium text-foreground">
            {sample.title}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {sample.wordCount.toLocaleString()} words ·{" "}
            {sample.isIncluded ? "In use" : "Not in use"}
          </p>
        </div>
        <Switch
          aria-label={`Use ${sample.title}`}
          checked={sample.isIncluded}
          disabled={isPending}
          onCheckedChange={(next) =>
            startTransition(async () => {
              await setIncluded({ sampleId: sample.id, isIncluded: next });
            })
          }
        />
        {isConfirming ? (
          <span className="flex items-center gap-1" role="alert">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirming(false)}
            >
              Keep
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await remove(sample.id);
                })
              }
              className="text-destructive"
            >
              Delete
            </Button>
          </span>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${sample.title}`}
            onClick={() => setIsConfirming(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <TrashIcon />
          </Button>
        )}
      </div>
      <p className="m-0 line-clamp-2 text-xs leading-normal text-muted-foreground">
        {sample.preview}
      </p>
    </li>
  );
}

function AddSampleDialog({
  voiceId,
  isFull,
}: {
  voiceId: string;
  isFull: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { trigger: add } = useAddSample(voiceId);
  const form = useForm<SampleValues>({ resolver: zodResolver(sampleSchema), defaultValues: { title: "", content: "" } });
  const content = useWatch({ control: form.control, name: "content" });
  const { isSubmitting, errors } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    const result = await add(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset();
    setOpen(false);
  });

  async function readFile(file: File | undefined) {
    if (!file) return;
    form.setValue("content", (await file.text()).slice(0, limits.sampleContent), { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    if (!form.getValues("title")) form.setValue("title", file.name.replace(/\.[^.]+$/, ""), { shouldDirty: true });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" disabled={isFull} onClick={() => setOpen(true)}>
        <PlusIcon />
        Add sample
      </Button>
      <DialogBackdrop />
      <DialogContent className="w-[min(36rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="grid gap-1">
              <DialogTitle>Add a sample</DialogTitle>
              <DialogDescription>
                Something you wrote and are happy with, as you wrote it.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <XIcon />
            </DialogClose>
          </div>
          <div className="grid gap-4 p-5">
            <InputField control={form.control} name="title" label="Title" max={limits.sampleTitle} placeholder="Proposal, Fenwick Gallery (2025)" />
            <TextareaField
              control={form.control}
              name="content"
              label="Text"
              max={limits.sampleContent}
              rows={9}
              placeholder="Paste it here, or upload a .txt or .md file."
              description={`${countWords(content).toLocaleString()} words. At least ${limits.sampleWordsMin} are needed, and more gives a clearer voice.`}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              hidden
              onChange={(event) => readFile(event.target.files?.[0])}
            />
            {errors.root?.server ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errors.root.server.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border p-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
            >
              Upload a file
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
              Add sample
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
