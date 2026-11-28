"use client";

import { useEffect, useEffectEvent, type ComponentProps, type RefObject } from "react";
import { cn } from "~@/lib/utils";

export function ChoiceRow({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        className,
      )}
      {...props}
    />
  );
}

export function ChoiceShortcut({ children }: { children: number }) {
  return (
    <kbd aria-hidden="true" className="ml-auto hidden shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.65rem] leading-none text-faint-foreground sm:inline">
      {children}
    </kbd>
  );
}

export function useChoiceShortcuts({ scope, count, onPick, onSubmit, canSubmit }: { scope: RefObject<HTMLElement | null>; count: number; onPick: (index: number) => void; onSubmit: () => void; canSubmit: boolean }) {
  const handle = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (target.closest("[role=dialog], [role=menu], [role=listbox]") || target.matches("input[type=text], textarea, select, a, [role=combobox]")) return;
    if (target !== document.body && !scope.current?.contains(target)) return;
    const number = Number(event.key);
    if (number >= 1 && number <= count) {
      event.preventDefault();
      onPick(number - 1);
    } else if (event.key === "Enter" && canSubmit && !target.matches("button:not([role=radio]):not([role=checkbox])")) {
      event.preventDefault();
      onSubmit();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
}
