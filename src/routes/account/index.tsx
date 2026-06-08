import { Link, createFileRoute } from "@tanstack/react-router"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/account/")({
  component: ProfilePage,
})

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

function ProfilePage() {
  const { user } = Route.useRouteContext()

  const form = useForm({
    defaultValues: { name: user?.name ?? "" },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.updateUser({ name: value.name })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Profile updated")
    },
  })

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your display name and personal details.
        </p>
      </div>

      <div className="space-y-8 border-t pt-8">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-base font-medium">
            {initials}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Email address</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              To change your email address, go to{" "}
              <Link
                to="/account/security"
                className="text-foreground underline underline-offset-4"
              >
                Security
              </Link>
              .
            </p>
          </div>

          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Your name"
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
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  )
}
