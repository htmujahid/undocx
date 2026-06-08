import { createFileRoute } from "@tanstack/react-router"

import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/account/security")({
  component: SecurityPage,
})

const emailSchema = z.object({
  newEmail: z.email("Enter a valid email address"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
})

function SecurityPage() {
  const { user } = Route.useRouteContext()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const emailForm = useForm({
    defaultValues: { newEmail: "" },
    validators: { onSubmit: emailSchema },
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
      emailForm.reset()
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Password updated")
      passwordForm.reset()
    },
  })

  const deleteForm = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: deleteSchema },
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
    <div className="space-y-12">
      <div>
        <h1 className="text-lg font-semibold">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email address, password, and account security.
        </p>
      </div>

      {/* Change email */}
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
              Check your inbox at <span className="text-foreground">{sentTo}</span>{" "}
              and click the link to confirm your new email address.
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
              emailForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <emailForm.Field
                name="newEmail"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New email address</FieldLabel>
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
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <emailForm.Subscribe
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

      {/* Change password */}
      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-base font-medium">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password you don't use elsewhere.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            passwordForm.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <passwordForm.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
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

            <passwordForm.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />

            <passwordForm.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <passwordForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" variant="outline" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Updating…" : "Update password"}
              </Button>
            )}
          />
        </form>
      </section>

      {/* Delete account */}
      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-base font-medium text-destructive">Delete account</h2>
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

          <form
            onSubmit={(e) => {
              e.preventDefault()
              deleteForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <deleteForm.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
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

            <deleteForm.Subscribe
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
    </div>
  )
}
