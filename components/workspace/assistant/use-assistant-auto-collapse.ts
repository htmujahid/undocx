"use client"

import { useEffect } from "react"

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
