"use client";

import { createContext, useContext } from "react";

export type EditorNote = { id: string; where: string; href: string; when: string; text: string };
export type PanelTab = "assistant" | "notes";

export type PanelState = {
  isFocus: boolean;
  tab: PanelTab;
  setTab: (tab: PanelTab) => void;
  notes: EditorNote[];
  activeNoteId: string | null;
  showNote: (id: string) => void;
  resolveNote: (id: string) => void;
};

export const PanelContext = createContext<PanelState | null>(null);

export function usePanel() {
  const panel = useContext(PanelContext);
  if (!panel) throw new Error("usePanel needs EditorShell");
  return panel;
}
