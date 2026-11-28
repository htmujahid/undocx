"use client";

import { useState, useTransition } from "react";
import { Button } from "~@/components/ui/button";
import { TrashIcon } from "~@/components/ui/icons";
import { Switch } from "~@/components/ui/switch";
import { cn } from "~@/lib/utils";

export type SampleData = {
  id: string;
  title: string;
  preview: string;
  wordCount: number;
  isIncluded: boolean;
};

export function SampleRow({
  sample,
  onToggle,
  onRemove,
}: {
  sample: SampleData;
  onToggle: (id: string, isIncluded: boolean) => Promise<unknown> | void;
  onRemove: (id: string) => Promise<unknown> | void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <li className={cn("grid gap-1.5 py-3", !sample.isIncluded && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-medium text-foreground">
            {sample.title}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {sample.wordCount.toLocaleString()} words ·{" "}
            {sample.isIncluded ? "In use" : "Not in use"}
          </p>
        </div>
        <Switch
          aria-label={`Use ${sample.title}`}
          checked={sample.isIncluded}
          disabled={isPending}
          onCheckedChange={(next) =>
            startTransition(async () => {
              await onToggle(sample.id, next);
            })
          }
        />
        {isConfirming ? (
          <span className="flex items-center gap-1" role="alert">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirming(false)}
            >
              Keep
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await onRemove(sample.id);
                })
              }
              className="text-destructive"
            >
              Delete
            </Button>
          </span>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${sample.title}`}
            onClick={() => setIsConfirming(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <TrashIcon />
          </Button>
        )}
      </div>
      <p className="m-0 line-clamp-2 text-xs leading-normal text-muted-foreground">
        {sample.preview}
      </p>
    </li>
  );
}
