"use client";

export function Failure({ message }: { message: string | null }) {
  return message ? (
    <p className="m-0 text-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}
