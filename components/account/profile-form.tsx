"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const form = useForm<ProfileValues>({
    resolver: standardSchemaResolver(profileSchema),
    defaultValues: { name: defaultName },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(value: ProfileValues) {
    const { error } = await authClient.updateUser({ name: value.name })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Profile updated")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Your name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
