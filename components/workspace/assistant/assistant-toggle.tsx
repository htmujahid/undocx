"use client"

import { PanelRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/** Toggles the assistant sidebar. Must render inside the right SidebarProvider —
 * toggleSidebar drives the Sheet on mobile, which setOpen alone never opens. */
export function AssistantToggle() {
  const { state, isMobile, openMobile, toggleSidebar } = useSidebar()
  const open = isMobile ? openMobile : state === "expanded"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      aria-label="Toggle assistant panel"
    >
      <PanelRightIcon
        className={cn(
          "transition-colors",
          open ? "text-foreground" : "text-muted-foreground"
        )}
      />
    </Button>
  )
}
