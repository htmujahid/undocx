"use client";

import { createParts } from "@ui-sdk/react/primitive";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";
import { sortableList } from "./sortable-list-primitive";

const parts = createParts(sortableList, { root: "ul", item: "li", handle: "button" });

function SortableListItem({ className, ...props }: ComponentProps<typeof parts.Item>) {
  return <parts.Item className={cn("group/menu-item relative data-grabbed:z-10 data-grabbed:translate-y-(--drag-y) data-grabbed:rounded-md data-grabbed:bg-sidebar data-grabbed:shadow-md", className)} {...props} />;
}

function SortableListHandle({ className, ...props }: ComponentProps<typeof parts.Handle>) {
  return (
    <parts.Handle
      className={cn(
        "absolute top-1.5 right-1 flex size-5 cursor-grab touch-none items-center justify-center rounded-md text-sidebar-foreground opacity-0 outline-hidden select-none hover:bg-sidebar-accent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-pressed:cursor-grabbing aria-pressed:bg-sidebar-accent aria-pressed:opacity-100 [&>svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

const SortableList = parts.Root;

export { SortableList, SortableListHandle, SortableListItem };
