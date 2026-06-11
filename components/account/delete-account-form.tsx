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

const schema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
})

type DeleteAccountValues = z.infer<typeof schema>

export function DeleteAccountForm() {
  const form = useForm<DeleteAccountValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { password: "" },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(value: DeleteAccountValues) {
    const { error } = await authClient.deleteUser({
      password: value.password,
      callbackURL: "/",
    })
    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium text-destructive">
          Delete account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all your data. This action cannot
          be undone.
        </p>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your password to confirm. All your workspaces, generations, and
          account data will be permanently removed.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Deleting…" : "Delete my account"}
          </Button>
        </form>
      </div>
    </section>
  )
}
