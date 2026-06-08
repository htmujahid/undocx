import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const schema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
})

export function DeleteAccountForm() {
  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.deleteUser({
        password: value.password,
        callbackURL: "/",
      })
      if (error) {
        toast.error(error.message)
      }
    },
  })

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all your data. This action cannot be undone.
        </p>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your password to confirm. All your workspaces, generations, and account data will
          be permanently removed.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                variant="destructive"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Deleting…" : "Delete my account"}
              </Button>
            )}
          />
        </form>
      </div>
    </section>
  )
}
