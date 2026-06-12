"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { createPortal } from "react-dom"

import { $getNodeByKey, $getRoot } from "lexical"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import {
  $createSelectionMarkerNode,
  SelectionMarkerNode,
} from "./selection-marker-node"
import {
  snapshotSelectionMarkers,
  subscribeSelectionMarkers,
} from "./selection-marker-store"

interface IndicatorState {
  y: number
  left: number
  width: number
  insertBeforeKey: string | null
  mode: "start" | "end"
}

interface HighlightState {
  top: number
  left: number
  width: number
  height: number
}

export function SelectionMarkerPlugin({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const [editor] = useLexicalComposerContext()
  const [indicator, setIndicator] = useState<IndicatorState | null>(null)
  const [highlight, setHighlight] = useState<HighlightState | null>(null)
  const indicatorRef = useRef<IndicatorState | null>(null)
  // Mirror the latest indicator into a ref so the click handler reads current
  // state synchronously — an effect would lag by a render. Intentional.
  // eslint-disable-next-line react-hooks/refs
  indicatorRef.current = indicator

  const { startKey, endKey } = useSyncExternalStore(
    (cb) => subscribeSelectionMarkers(editor, cb),
    () => snapshotSelectionMarkers(editor),
    () => ({ startKey: null, endKey: null })
  )

  const hasStart = startKey !== null
  const hasEnd = endKey !== null
  const hasBoth = hasStart && hasEnd

  // Extracted as a stable callback so it can be referenced by both the
  // registerUpdateListener effect and the scroll/resize effect without
  // conditionally returning cleanup functions.

  const updateHighlight = useCallback(() => {
    if (!hasBoth || !startKey || !endKey) {
      setHighlight(null)
      return
    }

    const startEl = editor.getElementByKey(startKey)
    const endEl = editor.getElementByKey(endKey)
    const container = containerRef.current
    if (!startEl || !endEl || !container) {
      setHighlight(null)
      return
    }

    const startRect = startEl.getBoundingClientRect()
    const endRect = endEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const top = startRect.bottom
    const bottom = endRect.top
    if (bottom <= top + 2) {
      setHighlight(null)
      return
    }

    setHighlight({
      top,
      left: containerRect.left,
      width: containerRect.width,
      height: bottom - top,
    })
  }, [editor, hasBoth, startKey, endKey, containerRef])

  // Always-registered update listener — never conditionally returned so the
  // cleanup function is always a valid () => void.
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      requestAnimationFrame(updateHighlight)
    })
  }, [editor, updateHighlight])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial sync calc
    updateHighlight()
    window.addEventListener("scroll", updateHighlight, true)
    window.addEventListener("resize", updateHighlight)
    return () => {
      window.removeEventListener("scroll", updateHighlight, true)
      window.removeEventListener("resize", updateHighlight)
    }
  }, [updateHighlight])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) {
        setIndicator(null)
        return
      }

      const { startKey: sKey, endKey: eKey } = snapshotSelectionMarkers(editor)
      if (sKey !== null && eKey !== null) {
        setIndicator(null)
        return
      }

      const containerRect = container.getBoundingClientRect()

      if (
        e.clientX < containerRect.left ||
        e.clientX > containerRect.right ||
        e.clientY < containerRect.top ||
        e.clientY > containerRect.bottom
      ) {
        setIndicator(null)
        return
      }

      const keys: string[] = []
      let startAfterNonMarkerCount = -1

      editor.getEditorState().read(() => {
        const allChildren = $getRoot().getChildren()
        let nonMarkerCount = 0
        for (const child of allChildren) {
          if (child instanceof SelectionMarkerNode) {
            if (sKey !== null && child.getKey() === sKey) {
              startAfterNonMarkerCount = nonMarkerCount
            }
          } else {
            keys.push(child.getKey())
            nonMarkerCount++
          }
        }
      })

      const PAD = 10
      let prevBottom = containerRect.top
      let matched: IndicatorState | null = null
      const mouseY = e.clientY

      for (let i = 0; i <= keys.length; i++) {
        const el = i < keys.length ? editor.getElementByKey(keys[i]) : null
        const nextTop = el
          ? el.getBoundingClientRect().top
          : containerRect.bottom

        const zoneTop = prevBottom - PAD
        const zoneBottom = nextTop + PAD

        if (mouseY >= zoneTop && mouseY <= zoneBottom) {
          const y =
            i === 0
              ? nextTop - 8
              : i === keys.length
                ? prevBottom
                : (prevBottom + nextTop) / 2

          if (sKey !== null) {
            if (i <= startAfterNonMarkerCount) {
              matched = null
              break
            }
            matched = {
              y,
              left: containerRect.left,
              width: containerRect.width,
              insertBeforeKey: i < keys.length ? keys[i] : null,
              mode: "end",
            }
          } else {
            matched = {
              y,
              left: containerRect.left,
              width: containerRect.width,
              insertBeforeKey: i < keys.length ? keys[i] : null,
              mode: "start",
            }
          }
          break
        }

        if (el) prevBottom = el.getBoundingClientRect().bottom
      }

      setIndicator(matched)
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [editor, containerRef])

  const handleInsert = useCallback(() => {
    const state = indicatorRef.current
    if (!state) return

    const { startKey: sKey, endKey: eKey } = snapshotSelectionMarkers(editor)
    if (sKey !== null && eKey !== null) return

    editor.update(() => {
      const marker = $createSelectionMarkerNode(state.mode)
      if (state.insertBeforeKey) {
        const node = $getNodeByKey(state.insertBeforeKey)
        if (node) {
          node.insertBefore(marker)
          return
        }
      }
      $getRoot().append(marker)
    })

    setIndicator(null)
  }, [editor])

  return (
    <>
      {highlight &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
              pointerEvents: "none",
              zIndex: 10,
              background: "hsl(var(--primary)/0.04)",
              borderLeft: "2px solid hsl(var(--primary)/0.15)",
              borderRight: "2px solid hsl(var(--primary)/0.15)",
            }}
          />,
          document.body
        )}

      {indicator &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: indicator.y,
              left: indicator.left,
              width: indicator.width,
              transform: "translateY(-50%)",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <button
              type="button"
              onClick={handleInsert}
              title={
                indicator.mode === "start"
                  ? "Mark start of selection"
                  : "Mark end of selection"
              }
              style={{ pointerEvents: "all" }}
              className="group flex w-full cursor-pointer items-center px-8"
            >
              <div className="h-px flex-1 bg-primary/15 transition-colors group-hover:bg-primary/40" />
              <div className="mx-2 flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-background px-2.5 py-0.5 text-[10px] font-medium text-primary/45 shadow-sm transition-all group-hover:border-primary/50 group-hover:text-primary/85">
                {indicator.mode === "start" ? (
                  <>
                    <svg
                      viewBox="0 0 8 8"
                      className="size-2 fill-current"
                      aria-hidden="true"
                    >
                      <rect x="0" y="4.5" width="8" height="1.2" />
                      <polygon points="4,0.5 7,4.5 1,4.5" />
                    </svg>
                    <span>Mark start</span>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 8 8"
                      className="size-2 fill-current"
                      aria-hidden="true"
                    >
                      <rect x="0" y="2.3" width="8" height="1.2" />
                      <polygon points="4,7.5 7,3.5 1,3.5" />
                    </svg>
                    <span>Mark end</span>
                  </>
                )}
              </div>
              <div className="h-px flex-1 bg-primary/15 transition-colors group-hover:bg-primary/40" />
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
