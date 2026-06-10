import { useState } from "react"

import { toast } from "sonner"
import { z } from "zod"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUser } from "@/hooks/use-user"
import { authClient } from "@/lib/auth-client"

const schema = z.object({
  newEmail: z.email("Enter a valid email address"),
})

export function EmailForm() {
  const { user } = useUser()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const form = useForm({
    defaultValues: { newEmail: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
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
    },
  })

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium">Email address</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current:{" "}
          <span className="font-medium text-foreground">{user?.email}</span>
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="newEmail"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      New email address
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="new@example.com"
                      autoComplete="email"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                variant="outline"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send verification email"}
              </Button>
            )}
          />
        </form>
      )}
    </section>
  )
}
