"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { InputField, TextareaField } from "~@/components/ui/form-fields";
import { Switch } from "~@/components/ui/switch";
import { limits } from "~@/lib/context/limits";
import { audienceLevels } from "~@/lib/context/options";
import { profileSchema, type ProfileValues } from "~@/lib/context/schemas";
import { DeleteDialog } from "../../../_components/delete-dialog";
import { DetailHeader } from "../../../_components/detail-header";
import { FormSection } from "../../../_components/empty-pane";
import { OptionSelect } from "../../../_components/form-bits";
import { useDeleteProfile, useSetProfileDefault, useUpdateProfile } from "../../query";

type Nullable = "region" | "firstLanguage" | "writingLanguage" | "currency" | "units" | "dateFormat";

type Profile = Omit<ProfileValues, Nullable> & { [K in Nullable]: string | null } & { id: string; isDefault: boolean };

const isNew = (name: string) => name.startsWith("Untitled");

export function ProfileForm({ profile }: { profile: Profile }) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      role: profile.role,
      organization: profile.organization,
      industry: profile.industry,
      about: profile.about,
      region: profile.region ?? "",
      firstLanguage: profile.firstLanguage ?? "",
      writingLanguage: profile.writingLanguage ?? "",
      currency: profile.currency ?? "",
      units: profile.units ?? "",
      dateFormat: profile.dateFormat ?? "",
      audience: profile.audience,
      audienceLevel: profile.audienceLevel,
      facts: profile.facts,
      signoff: profile.signoff,
      contact: profile.contact,
    },
  });
  const { control } = form;
  const name = useWatch({ control, name: "name" });
  const [isDefault, setIsDefault] = useOptimistic(profile.isDefault);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { trigger: update } = useUpdateProfile(profile.id);
  const { trigger: setDefault } = useSetProfileDefault(profile.id);
  const { trigger: remove } = useDeleteProfile(profile.id);
  const save = form.handleSubmit(async (values) => {
    const result = await update(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });

  return (
    <>
      <DetailHeader
        backHref="/library/profiles"
        eyebrow="Writer profile"
        title={name.trim() || "Untitled profile"}
        form={form}
        onSave={() => void save()}
      >
        <label className="flex items-center gap-2 text-xs whitespace-nowrap text-muted-foreground">
          Default
          <Switch
            aria-label="Use for new documents by default"
            checked={isDefault}
            onCheckedChange={(next) =>
              startTransition(async () => {
                setIsDefault(next);
                await setDefault(next);
              })
            }
          />
        </label>
        <DeleteDialog
          label="Delete profile"
          title="Delete this profile?"
          description="Documents that used it keep their text, but lose the link."
          action={async () => {
            await remove();
            router.push("/library/profiles");
          }}
        />
      </DetailHeader>

      <div className="mx-auto grid w-full max-w-3xl gap-5 p-4 sm:p-6">
        <FormSection title="You" description="Who is writing. Undocx uses this to decide how much to explain and how to introduce you.">
          <InputField
            control={control}
            name="name"
            label="Profile name"
            max={limits.name}
            autoFocus={isNew(profile.name)}
            onFocus={(event) => isNew(profile.name) && event.currentTarget.select()}
            placeholder="Studio, web design"
            description="Only you see this. Name it by role, client or publication."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField control={control} name="role" label="Role" max={limits.profileLine} placeholder="Founder and lead designer" />
            <InputField control={control} name="organization" label="Organisation" max={limits.profileLine} placeholder="Northlight Studio" />
          </div>
          <div className="sm:max-w-[calc(50%-0.5rem)]">
            <InputField control={control} name="industry" label="Industry" max={limits.profileLine} placeholder="Web design and e-commerce" description="Sets the vocabulary Undocx assumes." />
          </div>
          <TextareaField
            control={control}
            name="about"
            label="About you"
            max={limits.profileField}
            autoResize
            placeholder="A three-person web studio in Leeds. Ten years of building shops for independents."
            description="What you do and your background, in a sentence or two."
          />
        </FormSection>

        <FormSection title="Where you write from" description="Locale details that keep dates, money and phrasing natural. Spelling is set separately, in Rules.">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField control={control} name="region" label="Region" max={limits.profileLine} placeholder="United Kingdom" description="Keeps examples, dates and references local." />
            <InputField control={control} name="firstLanguage" label="First language" max={limits.profileLine} placeholder="Urdu" description="Helps Undocx catch phrasing that reads as translated." />
            <InputField control={control} name="writingLanguage" label="Writes in" max={limits.profileLine} placeholder="English" description="The language your documents are written in." />
            <InputField control={control} name="currency" label="Currency" max={limits.profileLine} placeholder="GBP" description="Used when an amount has no symbol." />
            <InputField control={control} name="units" label="Units" max={limits.profileLine} placeholder="Metric" description="How distances, weights and temperatures are written." />
            <InputField control={control} name="dateFormat" label="Dates" max={limits.profileLine} placeholder="31 December 2026" description="How a date is written out in full." />
          </div>
        </FormSection>

        <FormSection title="Who you write for" description="The readers you usually have in mind. When this is filled in, Undocx does not ask who will read.">
          <TextareaField
            control={control}
            name="audience"
            label="Audience"
            max={limits.profileField}
            autoResize
            placeholder="Small shop owners and gallery managers. Short on time."
            description="Who they are and what they care about."
          />
          <div className="sm:max-w-sm">
            <Controller
              control={control}
              name="audienceLevel"
              render={({ field }) => <OptionSelect label="How familiar are they?" hint="Decides which terms need explaining." value={field.value} options={audienceLevels} onChange={field.onChange} />}
            />
          </div>
        </FormSection>

        <FormSection title="How you sign off" description="Used at the end of letters, emails and proposals.">
          <InputField control={control} name="signoff" label="Sign-off" max={limits.profileLine} placeholder="Kind regards, Sam" />
          <TextareaField
            control={control}
            name="contact"
            label="Contact details"
            max={limits.contact}
            autoResize
            className="min-h-16"
            placeholder={"sam@northlight.example\n0113 000 0000"}
            description="Only added where a document needs them, such as the last page of a proposal."
          />
        </FormSection>

        <FormSection title="Facts to rely on" description="Things Undocx should treat as true and never contradict.">
          <TextareaField
            control={control}
            name="facts"
            label="Facts"
            max={limits.profileField}
            autoResize
            className="min-h-28"
            placeholder={"Fixed prices.\nTwelve-week builds.\nPayment in two halves."}
            description="One per line works well: prices, dates, credentials, claims you can back up."
          />
        </FormSection>
      </div>
    </>
  );
}
