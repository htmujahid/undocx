"use client";

import { useSWRConfig } from "swr";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { searchStatusKey, useSearchStatus, useUpdateSearch } from "../query";

export function SearchStatus({ isBusy }: { isBusy: boolean }) {
  const { mutate } = useSWRConfig();
  const { data } = useSearchStatus();
  const { trigger, isMutating, data: result, reset } = useUpdateSearch();
  if (!data) return null;

  async function update() {
    await trigger();
    await mutate(searchStatusKey);
  }

  const blocked = result?.blocked ?? false;
  const text = blocked
    ? "This month's AI allowance is used up. Search updates when it resets."
    : data.stale === 0
      ? "Search is up to date with your documents."
      : `${data.stale} ${data.stale === 1 ? "document has" : "documents have"} changed since the last update. Your next question updates ${data.stale === 1 ? "it" : "them"} first.`;

  return (
    <p className="m-0 flex flex-wrap items-center justify-center gap-x-2 text-xs text-faint-foreground" role="status">
      <span>{text}</span>
      {data.stale > 0 && !blocked ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          disabled={isMutating || isBusy}
          onClick={() => {
            reset();
            void update();
          }}
        >
          {isMutating ? <LoaderCircleIcon className="animate-spin" /> : null}
          {isMutating ? "Updating…" : "Update search"}
        </Button>
      ) : null}
    </p>
  );
}
