"use client";

import { limits } from "~@/lib/context/limits";
import type { SampleValues } from "~@/lib/context/schemas";
import { cn } from "~@/lib/utils";
import { AddSampleDialog } from "./add-sample-dialog";
import { SampleRow, type SampleData } from "./sample-row";

export function SamplesSection({
  samples,
  onAdd,
  onToggle,
  onRemove,
}: {
  samples: SampleData[];
  onAdd: (values: SampleValues) => Promise<string | null>;
  onToggle: (id: string, isIncluded: boolean) => Promise<unknown> | void;
  onRemove: (id: string) => Promise<unknown> | void;
}) {
  const included = samples.filter((sample) => sample.isIncluded).length;
  const isReady = included >= limits.samplesMin;
  const remaining = Math.max(0, limits.samplesMin - included);
  return (
    <section aria-labelledby="samples-title" className="grid gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="samples-title" className="m-0 font-serif text-xl font-medium text-foreground">
            Samples
          </h2>
          <p className={cn("m-0 text-sm", isReady ? "text-primary" : "text-muted-foreground")}>
            {isReady
              ? `Ready. ${included} in use, up to ${limits.samplesMax}.`
              : `${remaining} more ${remaining === 1 ? "sample" : "samples"} needed. Use ${limits.samplesMin} to ${limits.samplesMax}.`}
          </p>
        </div>
        <AddSampleDialog isFull={samples.length >= limits.samplesMax} onAdd={onAdd} />
      </div>
      {samples.length > 0 ? (
        <ul className="m-0 list-none divide-y divide-border p-0">
          {samples.map((sample) => (
            <SampleRow key={sample.id} sample={sample} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </ul>
      ) : (
        <p className="m-0 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">No samples yet. Add three things you wrote and are happy with.</p>
      )}
    </section>
  );
}
