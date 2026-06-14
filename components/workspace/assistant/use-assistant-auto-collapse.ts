"use client"

import { useEffect } from "react"

/** Collapses the assistant sidebar when the viewport is too narrow to fit it
 * alongside the document, and re-expands it when there is room again. Manual
 * toggling still works at any size. */
export function useAssistantAutoCollapse(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1279px)")
    if (mql.matches) setOpen(false)
    const onChange = (e: MediaQueryListEvent) => setOpen(!e.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
