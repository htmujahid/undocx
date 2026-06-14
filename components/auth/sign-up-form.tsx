"use client"

import { useState } from "react"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth-client"

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const form = useForm<SignUpValues>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(value: SignUpValues) {
    const { error } = await signUp.email({
      name: value.name,
      email: value.email,
      password: value.password,
      callbackURL: "/workspace",
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setSubmittedEmail(value.email)
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheckIcon className="size-6" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">
              {submittedEmail}
            </span>
            . Click the link in that email to verify your account before signing
            in.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it? Check your spam folder, or&nbsp;
          <Link
            href="/auth/sign-in"
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm font-medium",
            })}
          >
            go to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started for free, no credit card required
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link
          href="/auth/sign-in"
          className={buttonVariants({
            variant: "link",
            className: "h-auto p-0 text-sm font-medium",
          })}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
