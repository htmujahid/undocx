"use client"

import { cn } from "@/lib/utils"

export const COLLECTION_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#06b6d4",
  "#64748b",
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function CollectionColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLLECTION_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          className={cn(
            "size-5 rounded-full transition-transform hover:scale-110",
            value === color && "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
