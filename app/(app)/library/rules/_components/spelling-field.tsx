"use client";

import { OptionSelect } from "~@/components/ui/option-select";
import { spellingOptions } from "~@/lib/context/limits";

export function SpellingField({ value, onChange }: { value: string | null; onChange: (next: string | null) => void }) {
  return (
    <div className="sm:max-w-sm">
      <OptionSelect
        label="Spelling"
        hint="Independent of your region, so a US writer can still use British spelling for a UK client."
        value={value}
        options={[...spellingOptions]}
        notSetLabel="No preference"
        onChange={onChange}
      />
    </div>
  );
}
