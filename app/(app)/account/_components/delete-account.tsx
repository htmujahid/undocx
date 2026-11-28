"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { deleteUser, signIn } from "~@/lib/auth/client";
import { deleteAccountSchema, type DeleteAccountValues } from "~@/lib/auth/schemas";

const removed = [
  "Your account and sign-in",
  "Every document, with its notes, versions, brief, search index and assistant conversation",
  "Your chat history",
  "Your sources and the files you uploaded",
  "Your writer profiles, voices and rule sets",
  "Usage records of your AI requests",
];

export function DeleteAccount({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const form = useForm<DeleteAccountValues>({ resolver: zodResolver(deleteAccountSchema), defaultValues: { confirmation: "" } });
  const { isSubmitting, errors } = form.formState;

  const submit = form.handleSubmit(async () => {
    const { error } = await deleteUser({ callbackURL: "/" });
    if (!error) {
      router.push("/");
      router.refresh();
      return;
    }
    if (error.code === "SESSION_EXPIRED" || error.code === "SESSION_NOT_FRESH") setNeedsSignIn(true);
    else form.setError("root.server", { message: error.code === "ACTIVE_SUBSCRIPTION" ? "Cancel your Pro subscription under Manage billing first, then delete your account." : "Your account was not deleted. Try again in a moment." });
  });

  return (
    <section aria-labelledby="delete-title" className="grid gap-4 rounded-lg border border-destructive/40 bg-card p-5">
      <div className="grid gap-1">
        <h2 id="delete-title" className="m-0 font-serif text-xl font-medium text-foreground">
          Delete account
        </h2>
        <p className="m-0 text-sm leading-normal text-muted-foreground">Deleting your account is permanent. It cannot be undone and we cannot recover anything afterwards. Export any document you want to keep first.</p>
      </div>
      <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-foreground">
        {removed.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="m-0 text-xs leading-normal text-muted-foreground">Deleted data is removed from our database and file storage straight away, and from backups within 30 days. See the privacy page for the details.</p>
      <div>
        <Button variant="secondary" className="text-destructive" onClick={() => setOpen(true)}>
          Delete account…
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            form.reset();
            setNeedsSignIn(false);
          }
        }}
      >
        <DialogBackdrop />
        <DialogContent className="w-[min(28rem,calc(100vw-2rem))]">
          <form onSubmit={submit} noValidate>
            <div className="grid gap-4 p-5">
              <div className="grid gap-2">
                <DialogTitle>Delete {email}?</DialogTitle>
                <DialogDescription>Everything listed above is deleted for good. Type DELETE to confirm.</DialogDescription>
              </div>
              <InputField control={form.control} name="confirmation" label="Confirmation" isLabelHidden autoFocus autoComplete="off" placeholder="DELETE" />
              {needsSignIn ? (
                <div className="grid gap-2 rounded-md border border-border bg-background p-3" role="alert">
                  <p className="m-0 text-sm text-foreground">For your security, sign in again before deleting your account. Then come back here and confirm.</p>
                  <Button type="button" size="sm" variant="secondary" className="justify-self-start" onClick={() => void signIn.social({ provider: "google", callbackURL: "/account" })}>
                    Sign in with Google again
                  </Button>
                </div>
              ) : null}
              {errors.root?.server ? (
                <p className="m-0 text-sm text-destructive" role="alert">
                  {errors.root.server.message}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep my account</DialogClose>
              <Button type="submit" variant="primary" disabled={isSubmitting || needsSignIn}>
                {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
                Delete everything
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
