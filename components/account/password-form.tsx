"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { setPassword } from "@/app/(app)/account/security/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const setSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ChangePasswordValues = z.infer<typeof changeSchema>
type SetPasswordValues = z.infer<typeof setSchema>

export function PasswordForm({ hasCredential }: { hasCredential: boolean }) {
  const router = useRouter()

  const changeForm = useForm<ChangePasswordValues>({
    resolver: standardSchemaResolver(changeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const setForm = useForm<SetPasswordValues>({
    resolver: standardSchemaResolver(setSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  async function onChangeSubmit(value: ChangePasswordValues) {
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
    changeForm.reset()
  }

  async function onSetSubmit(value: SetPasswordValues) {
    try {
      await setPassword(value.newPassword)
      toast.success(
        "Password set — you can now sign in with email and password"
      )
      setForm.reset()
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to set password")
    }
  }

  return (
    <section className="space-y-5 border-t pt-8">
      <div>
        <h2 className="text-base font-medium">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasCredential
            ? "Choose a strong password you don't use elsewhere."
            : "Add a password so you can also sign in with your email address."}
        </p>
      </div>

      {hasCredential ? (
        <form
          onSubmit={changeForm.handleSubmit(onChangeSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="currentPassword"
              control={changeForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
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
            <Controller
              name="newPassword"
              control={changeForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={changeForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirm new password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            variant="outline"
            disabled={changeForm.formState.isSubmitting}
          >
            {changeForm.formState.isSubmitting
              ? "Updating…"
              : "Update password"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={setForm.handleSubmit(onSetSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="newPassword"
              control={setForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={setForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirm new password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            variant="outline"
            disabled={setForm.formState.isSubmitting}
          >
            {setForm.formState.isSubmitting
              ? "Setting password…"
              : "Set password"}
          </Button>
        </form>
      )}
    </section>
  )
}
