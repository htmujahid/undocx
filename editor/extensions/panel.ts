import { batch, effect, signal } from "@lexical/extension";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { mergeRegister } from "@lexical/utils";
import { defineExtension } from "lexical";
import { NotesExtension } from "./notes";
import { SourcesExtension } from "./sources";

export type PanelTab = "outline" | "assistant" | "notes" | "versions" | "checks";

export const PanelExtension = defineExtension({
  name: "undocx/Panel",
  dependencies: [NotesExtension, SourcesExtension],
  build: () => {
    const open = signal(true);
    const tab = signal<PanelTab>("outline");
    const isFocus = signal(false);
    const sourceForm = signal(false);
    return {
      open,
      tab,
      isFocus,
      sourceForm,
      setOpen(next: boolean) {
        batch(() => {
          open.value = next;
          isFocus.value = false;
        });
      },
      setTab(next: PanelTab) {
        tab.value = next;
      },
      setFocus(next: boolean) {
        isFocus.value = next;
      },
      setSourceForm(next: boolean) {
        sourceForm.value = next;
      },
      showNotes() {
        batch(() => {
          open.value = true;
          tab.value = "notes";
          isFocus.value = false;
        });
      },
      showSources(adding: boolean) {
        batch(() => {
          open.value = true;
          tab.value = "outline";
          isFocus.value = false;
          if (adding) sourceForm.value = true;
        });
      },
    };
  },
  register: (editor, config, state) => {
    const panel = state.getOutput();
    const notes = state.getDependency(NotesExtension).output;
    const sources = state.getDependency(SourcesExtension).output;
    return mergeRegister(
      effect(() => {
        if (notes.requested.value) panel.showNotes();
      }),
      effect(() => {
        const request = sources.requested.value;
        if (request) panel.showSources(request.adding === true);
      }),
    );
  },
});

export function usePanel() {
  const { output } = useExtensionDependency(PanelExtension);
  return {
    open: useSignalValue(output.open),
    tab: useSignalValue(output.tab),
    isFocus: useSignalValue(output.isFocus),
    sourceForm: useSignalValue(output.sourceForm),
    setOpen: output.setOpen,
    setTab: output.setTab,
    setFocus: output.setFocus,
    setSourceForm: output.setSourceForm,
  };
}
