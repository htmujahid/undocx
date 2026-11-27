import { EditorStateExtension, signal } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import { $createNodeSelection, $getNearestNodeFromDOMNode, $getRoot, $getSelection, $getState, $isRangeSelection, $setSelection, $setState, COMMAND_PRIORITY_EDITOR, createCommand, createState, defineExtension, registerEventListener, type LexicalEditor } from "lexical";
import { useEffect } from "react";
import { $createPageBreakNode, $isPageBreakNode, PageBreakNode } from "../nodes/page-break-node";

export const paperSizes = {
  a4: { label: "A4", width: 210, height: 297 },
  letter: { label: "Letter", width: 215.9, height: 279.4 },
  legal: { label: "Legal", width: 215.9, height: 355.6 },
  executive: { label: "Executive", width: 184.2, height: 266.7 },
  folio: { label: "Folio", width: 215.9, height: 330.2 },
  b5: { label: "B5", width: 176, height: 250 },
} as const;

export type PaperId = keyof typeof paperSizes;
export type Orientation = "portrait" | "landscape";
export type Layout = "pages" | "pageless";
export type Margins = { top: number; right: number; bottom: number; left: number };

const uniform = (value: number): Margins => ({ top: value, right: value, bottom: value, left: value });

export const marginPresets = [
  { id: "none", label: "None", margins: uniform(0) },
  { id: "narrow", label: "Narrow", margins: uniform(12.7) },
  { id: "moderate", label: "Moderate", margins: { top: 25.4, right: 19.1, bottom: 25.4, left: 19.1 } },
  { id: "normal", label: "Normal", margins: uniform(25.4) },
  { id: "wide", label: "Wide", margins: { top: 25.4, right: 50.8, bottom: 25.4, left: 50.8 } },
] as const;

export type MarginId = (typeof marginPresets)[number]["id"];
export type PageSettings = { layout: Layout; paper: PaperId; orientation: Orientation; margins: MarginId };

export const defaultPageSettings: PageSettings = { layout: "pageless", paper: "a4", orientation: "portrait", margins: "normal" };

export const MM_TO_PX = 96 / 25.4;

export function pageDimensions({ paper, orientation }: Pick<PageSettings, "paper" | "orientation">) {
  const { width, height } = paperSizes[paper];
  return orientation === "landscape" ? { width: height, height: width } : { width, height };
}

export function resolveMargins({ margins }: Pick<PageSettings, "margins">): Margins {
  return (marginPresets.find((preset) => preset.id === margins) ?? marginPresets[3]).margins;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizePageSettings(value: unknown): PageSettings {
  if (!isRecord(value)) return defaultPageSettings;
  return {
    layout: value.layout === "pages" ? "pages" : defaultPageSettings.layout,
    paper: typeof value.paper === "string" && value.paper in paperSizes ? (value.paper as PaperId) : defaultPageSettings.paper,
    orientation: value.orientation === "landscape" ? "landscape" : "portrait",
    margins: marginPresets.find((preset) => preset.id === value.margins)?.id ?? defaultPageSettings.margins,
  };
}

const pageState = createState("page", {
  parse: normalizePageSettings,
  isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
});

export function usePageSettings(): PageSettings {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getState($getRoot(), pageState));
}

export function setPageSettings(editor: LexicalEditor, update: (current: PageSettings) => PageSettings) {
  editor.update(() => {
    $setState($getRoot(), pageState, (current) => normalizePageSettings(update(current)));
  });
}

export const PAGE_GAP_PX = 16;
const PUSH_ATTRIBUTE = "data-page-push";

export function pageStridePx(settings: Pick<PageSettings, "paper" | "orientation">) {
  return pageDimensions(settings).height * MM_TO_PX + PAGE_GAP_PX;
}

function breakUnits(root: HTMLElement): HTMLElement[] {
  const units: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName === "UL" || child.tagName === "OL") {
      for (const item of Array.from(child.children)) if (item instanceof HTMLElement) units.push(item);
    } else {
      units.push(child);
    }
  }
  return units;
}

function clearPushes(root: HTMLElement) {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>(`[${PUSH_ATTRIBUTE}]`))) {
    element.style.removeProperty("margin-top");
    element.removeAttribute(PUSH_ATTRIBUTE);
  }
}

const isHeading = (element: HTMLElement) => /^H[1-6]$/.test(element.tagName);
const isPageBreak = (element: HTMLElement) => element.matches("hr[data-lexical-page-break]");

export function paginate(root: HTMLElement, settings: PageSettings): number {
  clearPushes(root);
  const sheet = root.parentElement;
  if (!sheet) return 1;
  const sheetTop = sheet.getBoundingClientRect().top;
  const margins = resolveMargins(settings);
  const pageHeight = pageDimensions(settings).height * MM_TO_PX;
  const top = margins.top * MM_TO_PX;
  const bottom = margins.bottom * MM_TO_PX;
  const stride = pageHeight + PAGE_GAP_PX;
  const capacity = pageHeight - top - bottom;

  const units = breakUnits(root);
  const rects = units.map((unit) => {
    const rect = unit.getBoundingClientRect();
    return { top: rect.top - sheetTop, bottom: rect.bottom - sheetTop };
  });

  const pushes: number[] = [];
  let shift = 0;
  let lastBottom = top;
  let minTop = 0;
  let lastBreakPage = -1;
  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    const natural = rects[index];
    let unitTop = natural.top + shift;
    let unitBottom = natural.bottom + shift;
    const page = Math.max(0, Math.floor(unitTop / stride));
    const start = page * stride + top;
    const end = page * stride + pageHeight - bottom;
    const nextStart = (page + 1) * stride + top;
    let push = 0;
    if (unitTop < start - 0.5) {
      push = start - unitTop;
    } else if (unitTop >= end - 0.5) {
      push = nextStart - unitTop;
    } else {
      const following = isHeading(unit) ? units[index + 1] : undefined;
      const groupBottom = following ? Math.max(unitBottom, rects[index + 1].bottom + shift) : unitBottom;
      if (groupBottom > end + 0.5 && groupBottom - unitTop <= capacity && unitTop > start + 0.5) push = nextStart - unitTop;
    }
    unitTop += push;
    if (minTop && unitTop < minTop - 0.5) push += minTop - unitTop;
    minTop = 0;
    if (push > 0.5) shift += push;
    unitBottom = natural.bottom + shift;
    pushes[index] = push > 0.5 ? push : 0;
    lastBottom = unitBottom;
    if (isPageBreak(unit)) {
      lastBreakPage = Math.floor((natural.top + shift) / stride);
      minTop = (lastBreakPage + 1) * stride + top;
    }
  }

  units.forEach((unit, index) => {
    if (!pushes[index]) return;
    const gap = index > 0 ? rects[index].top - rects[index - 1].bottom : 0;
    unit.style.marginTop = `${Math.max(gap, 0) + pushes[index]}px`;
    unit.setAttribute(PUSH_ATTRIBUTE, "");
  });

  const byContent = Math.floor(Math.max(lastBottom - 1, 0) / stride) + 1;
  return Math.max(1, byContent, minTop ? lastBreakPage + 2 : 0);
}

export function usePagination() {
  const [editor] = useLexicalComposerContext();
  const settings = usePageSettings();
  const { layout, paper, orientation, margins } = settings;
  const { setPages } = useExtensionDependency(PageExtension).output;
  useEffect(() => {
    if (layout === "pageless") {
      setPages(1);
      return;
    }
    const current: PageSettings = { layout, paper, orientation, margins };
    const run = () => {
      const root = editor.getRootElement();
      if (root) setPages(paginate(root, current));
    };
    return mergeRegister(
      editor.registerRootListener((root) => {
        if (!root) return;
        run();
        const observer = new ResizeObserver(run);
        observer.observe(root);
        void document.fonts?.ready.then(run);
        return () => {
          observer.disconnect();
          clearPushes(root);
        };
      }),
      editor.registerUpdateListener(run),
    );
  }, [editor, layout, paper, orientation, margins, setPages]);
}

export const INSERT_PAGE_BREAK_COMMAND = createCommand<void>("INSERT_PAGE_BREAK_COMMAND");

export const PageExtension = defineExtension({
  name: "undocx/Page",
  nodes: [PageBreakNode],
  build: () => {
    const pages = signal(1);
    return {
      pages,
      setPages(next: number) {
        pages.value = next;
      },
    };
  },
  register: (editor) =>
    mergeRegister(
      editor.registerCommand(
        INSERT_PAGE_BREAK_COMMAND,
        () => {
          if (!$isRangeSelection($getSelection())) return false;
          $insertNodeToNearestRoot($createPageBreakNode());
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerRootListener((root) => {
        if (!root) return;
        return registerEventListener(root, "click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const element = target.closest("hr[data-lexical-page-break]");
          if (!element) return;
          editor.update(() => {
            const node = $getNearestNodeFromDOMNode(element);
            if (!$isPageBreakNode(node)) return;
            const selection = $createNodeSelection();
            selection.add(node.getKey());
            $setSelection(selection);
          });
        });
      }),
    ),
});

export function usePageCount() {
  return useSignalValue(useExtensionDependency(PageExtension).output.pages);
}
