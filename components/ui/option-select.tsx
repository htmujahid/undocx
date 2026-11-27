"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~@/components/ui/select";
import type { Option } from "~@/lib/context/options";

const NONE = "__none__";

export function OptionSelect({
  label,
  hint,
  value,
  options,
  onChange,
  notSetLabel = "Not set",
}: {
  label: string;
  hint?: string;
  value: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
  notSetLabel?: string;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <Select
        value={value ?? NONE}
        onValueChange={(next) => next && onChange(next === NONE ? null : next)}
      >
        <SelectLabel className="text-xs font-medium text-muted-foreground">
          {label}
        </SelectLabel>
        <SelectTrigger className="w-full border border-input bg-card px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={NONE} label={notSetLabel}>
            {notSetLabel}
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint ? (
        <p className="m-0 text-xs leading-normal text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
