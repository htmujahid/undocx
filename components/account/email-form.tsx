"use client"

import { useState } from "react"

import { toast } from "sonner"
import { z } from "zod"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"

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
  newEmail: z.email("Enter a valid email address"),
})

type EmailValues = z.infer<typeof schema>

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const form = useForm<EmailValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { newEmail: "" },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(value: EmailValues) {
    const { error } = await authClient.changeEmail({
      newEmail: value.newEmail,
      callbackURL: "/account",
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setSentTo(value.newEmail)
    setEmailSent(true)
    form.reset()
  }

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium">Email address</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current:{" "}
          <span className="font-medium text-foreground">{currentEmail}</span>
        </p>
      </div>

      {emailSent ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Verification email sent</p>
          <p className="mt-1 text-muted-foreground">
            Check your inbox at{" "}
            <span className="text-foreground">{sentTo}</span> and click the link
            to confirm your new email address.
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-3 text-xs underline underline-offset-4 hover:text-foreground text-muted-foreground"
          >
            Send to a different address
          </button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="newEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New email address</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="new@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send verification email"}
          </Button>
        </form>
      )}
    </section>
  )
}
