"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AddSourceDialog } from "~@/components/sources/add-source-dialog";
import { SourceSearch, sourceMeta } from "~@/components/sources/source-search";
import { XIcon } from "~@/components/ui/icons";
import { Button } from "~@/components/ui/button";
import { TextareaField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { OptionSelect } from "~@/components/ui/option-select";
import { documentLimits } from "~@/lib/documents/limits";
import { startSchema, type StartValues } from "~@/lib/documents/schemas";
import { documentTypes } from "~@/lib/documents/types";
import { useCreateDocument } from "../../query";
import { startDocument } from "../actions";

type Pick = { id: string; name: string };

const typeOptions = documentTypes.map((type) => ({ value: type.key, label: `${type.label}: ${type.extra}` }));

function PickSelect({ label, hint, items, emptyHint, value, onChange }: { label: string; hint: string; items: Pick[]; emptyHint: string; value: string | null; onChange: (value: string | null) => void }) {
  if (items.length === 0) {
    return (
      <div className="grid content-start gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <p className="m-0 text-xs leading-normal text-muted-foreground">
          {emptyHint}{" "}
          <Link href="/library" className="text-foreground underline underline-offset-[0.2em] hover:text-primary-deep">
            Open the library
          </Link>
        </p>
      </div>
    );
  }
  return <OptionSelect label={label} hint={hint} value={value} options={items.map((item) => ({ value: item.id, label: item.name }))} notSetLabel="None" onChange={onChange} />;
}

export function NewDocumentForm({ profiles, voices, ruleSets }: { profiles: (Pick & { isDefault: boolean })[]; voices: Pick[]; ruleSets: Pick[] }) {
  const router = useRouter();
  const { trigger: createBlank, isMutating: isCreatingBlank } = useCreateDocument();
  const form = useForm<StartValues>({
    resolver: zodResolver(startSchema),
    defaultValues: { prompt: "", type: null, profileId: profiles.find((profile) => profile.isDefault)?.id ?? null, voiceId: null, ruleSetId: null, sourceIds: [] },
  });
  const { isSubmitting, errors } = form.formState;
  const [isAdding, setIsAdding] = useState(false);
  const [picked, setPicked] = useState<{ id: string; title: string }[]>([]);

  function pick(next: { id: string; title: string }[]) {
    setPicked(next);
    form.setValue("sourceIds", next.map((item) => item.id));
  }

  const submit = form.handleSubmit(async (values) => {
    const result = await startDocument(values);
    if ("error" in result) {
      form.setError("root.server", { message: result.error });
      return;
    }
    router.push(`/documents/${result.id}/setup`);
  });

  async function blank() {
    const id = await createBlank();
    router.push(id ? `/documents/${id}` : "/documents");
  }

  return (
    <>
    <form onSubmit={submit} noValidate className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
      <div>
        <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">New document</p>
        <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">What are you writing?</h1>
        <p className="m-0 mt-2 text-sm leading-normal text-muted-foreground">Describe it in a sentence or two. Undocx asks only what it cannot already tell from your picks, then writes a first draft.</p>
      </div>

      <TextareaField
        control={form.control}
        name="prompt"
        label="Your brief"
        max={documentLimits.prompt}
        autoResize
        autoFocus
        className="min-h-28"
        placeholder="A proposal to Marlow & Finch, a bookshop, to rebuild their online store. Fixed price."
        description="Who it is for, what it should achieve, anything you already know."
      />

      <section className="grid gap-4 rounded-lg border border-border bg-card p-5" aria-labelledby="picks-title">
        <div>
          <h2 id="picks-title" className="m-0 font-serif text-lg font-medium text-foreground">
            Start from what you already have
          </h2>
          <p className="m-0 text-sm text-muted-foreground">All optional. Each pick means one less question.</p>
        </div>
        <Controller control={form.control} name="type" render={({ field }) => <OptionSelect label="Document type" hint="Leave it unset and Undocx works it out from your brief." value={field.value} options={typeOptions} notSetLabel="Let Undocx work it out" onChange={field.onChange} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller control={form.control} name="profileId" render={({ field }) => <PickSelect label="Writer profile" hint="Who you are and who reads you." items={profiles} emptyHint="No profiles yet." value={field.value} onChange={field.onChange} />} />
          <Controller control={form.control} name="voiceId" render={({ field }) => <PickSelect label="Voice" hint="How it should sound." items={voices} emptyHint="No voices yet." value={field.value} onChange={field.onChange} />} />
          <Controller control={form.control} name="ruleSetId" render={({ field }) => <PickSelect label="Rules" hint="Spelling and words to avoid." items={ruleSets} emptyHint="No rule sets yet." value={field.value} onChange={field.onChange} />} />
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-5" aria-labelledby="sources-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="sources-title" className="m-0 font-serif text-lg font-medium text-foreground">
              Sources
            </h2>
            <p className="m-0 text-sm text-muted-foreground">Files, text and links Undocx should read and cite.</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            Add a source
          </Button>
        </div>
        {picked.length > 0 ? (
          <ul aria-label="Sources to use" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {picked.map((item) => (
              <li key={item.id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-input bg-background py-1 pr-1 pl-3 text-sm text-foreground">
                <span className="min-w-0 truncate">{item.title}</span>
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.title}`} className="size-6 rounded-full" onClick={() => pick(picked.filter((entry) => entry.id !== item.id))}>
                  <XIcon className="size-3" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <SourceSearch
          emptyText="No sources yet. Add one to use it here and in any other document."
          renderItem={(item) => {
            const isPicked = picked.some((entry) => entry.id === item.id);
            return (
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                <input type="checkbox" checked={isPicked} onChange={(event) => pick(event.target.checked ? [...picked, { id: item.id, title: item.title }] : picked.filter((entry) => entry.id !== item.id))} className="size-4 accent-primary" />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-foreground">{item.title}</span>
                  <span className="truncate text-xs text-muted-foreground">{sourceMeta(item)}</span>
                </span>
              </label>
            );
          }}
        />
      </section>

      {errors.root?.server ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {errors.root.server.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" disabled={isCreatingBlank || isSubmitting} onClick={() => void blank()}>
          Start with a blank page
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          Continue
        </Button>
      </div>
    </form>
    <AddSourceDialog
      open={isAdding}
      onOpenChange={setIsAdding}
      onAdded={(created) => pick([...picked, { id: created.id, title: created.title }])}
    />
    </>
  );
}
