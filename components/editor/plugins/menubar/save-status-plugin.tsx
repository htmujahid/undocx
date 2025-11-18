"use client";

import { Check, Cloud } from "lucide-react";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { cn } from "@/lib/utils";

/**
 * SaveStatusPlugin - Displays the current save status of the document
 *
 * Shows different states:
 * - 'idle': No status shown (user is not actively editing)
 * - 'saving': Shows "Saving..." with a cloud icon
 * - 'saved': Shows "Saved" with a check icon
 */
export function SaveStatusPlugin() {
  const { saveStatus, documentMode } = useEditorContext();

  if (saveStatus === "idle" || documentMode !== "editing") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-opacity",
        saveStatus === "saving" && "text-muted-foreground",
        saveStatus === "saved" && "text-green-600 dark:text-green-500",
      )}
    >
      {saveStatus === "saving" ? (
        <>
          <Cloud className="h-3.5 w-3.5 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Saved</span>
        </>
      )}
    </div>
  );
}
