"use client"

import { toast } from "sonner"
import { z } from "zod"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(value: ForgotPasswordValues) {
    const { error } = await authClient.requestPasswordReset({
      email: value.email,
      redirectTo: "/auth/reset-password",
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Reset link sent. Check your inbox.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 text-foreground"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <FieldDescription>
                  We&apos;ll send a reset link to this address.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?&nbsp;
        <Link
          href="/auth/sign-in"
          className={buttonVariants({
            variant: "link",
            className: "h-auto p-0 text-sm font-medium",
          })}
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
