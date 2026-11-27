import { signal } from "@lexical/extension";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $dfs, mergeRegister } from "@lexical/utils";
import {
  $createNodeSelection,
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  defineExtension,
  registerEventListener,
  safeCast,
} from "lexical";
import { $createCitationNode, $isCitationNode, CitationNode } from "../nodes/citation-node";

export type Source = { id: string; title: string; url?: string };

export const INSERT_CITATION_COMMAND = createCommand<string>("INSERT_CITATION_COMMAND");

function sameList(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export const SourcesExtension = defineExtension({
  name: "undocx/Sources",
  nodes: [CitationNode],
  config: safeCast<{ sources: Source[] }>({ sources: [] }),
  build: (editor, config) => {
    const sources = signal<Source[]>(config.sources);
    const requested = signal<{ id: string | null; adding?: boolean } | null>(null);
    return {
      sources,
      order: signal<string[]>([]),
      counts: signal<ReadonlyMap<string, number>>(new Map()),
      selected: signal<string | null>(null),
      requested,
      add(title: string, url?: string) {
        const id = crypto.randomUUID();
        sources.value = [...sources.peek(), { id, title: title.trim(), url: url?.trim() || undefined }];
        return id;
      },
      remove(id: string) {
        editor.update(() => {
          for (const { node } of $dfs()) if ($isCitationNode(node) && node.getSourceId() === id) node.remove();
        });
        sources.value = sources.peek().filter((source) => source.id !== id);
      },
      cite(id: string) {
        editor.dispatchCommand(INSERT_CITATION_COMMAND, id);
      },
      startAdding() {
        requested.value = { id: null, adding: true };
      },
      reveal(id: string) {
        let key: string | null = null;
        editor.update(
          () => {
            for (const { node } of $dfs()) {
              if ($isCitationNode(node) && node.getSourceId() === id) {
                key = node.getKey();
                const selection = $createNodeSelection();
                selection.add(key);
                $setSelection(selection);
                return;
              }
            }
          },
          {
            onUpdate: () => {
              editor.focus();
              if (key) editor.getElementByKey(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
            },
          },
        );
      },
    };
  },
  register: (editor, config, state) => {
    const { order, counts, selected, requested } = state.getOutput();
    return mergeRegister(
      editor.registerCommand(
        INSERT_CITATION_COMMAND,
        (sourceId) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const end = selection.isBackward() ? selection.anchor : selection.focus;
          const caret = $createRangeSelection();
          caret.anchor.set(end.key, end.offset, end.type);
          caret.focus.set(end.key, end.offset, end.type);
          $setSelection(caret);
          caret.insertNodes([$createCitationNode(sourceId)]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const ids: string[] = [];
          const nextCounts = new Map<string, number>();
          const nodes: CitationNode[] = [];
          for (const { node } of $dfs()) {
            if (!$isCitationNode(node)) continue;
            const id = node.getSourceId();
            nodes.push(node);
            nextCounts.set(id, (nextCounts.get(id) ?? 0) + 1);
            if (!ids.includes(id)) ids.push(id);
          }
          for (const node of nodes) {
            const element = editor.getElementByKey(node.getKey());
            const text = String(ids.indexOf(node.getSourceId()) + 1);
            if (element && element.textContent !== text) element.textContent = text;
          }
          if (!sameList(order.peek(), ids)) order.value = ids;
          const current = counts.peek();
          if (current.size !== nextCounts.size || [...nextCounts].some(([id, count]) => current.get(id) !== count)) counts.value = nextCounts;
          const selection = $getSelection();
          const first = $isNodeSelection(selection) ? selection.getNodes()[0] : null;
          selected.value = $isCitationNode(first) ? first.getSourceId() : null;
        });
      }),
      editor.registerRootListener((root) => {
        if (!root) return;
        return registerEventListener(root, "click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const citation = target.closest("sup[data-source-id]");
          const id = citation?.getAttribute("data-source-id");
          if (!citation || !id) return;
          editor.update(() => {
            const node = $getNearestNodeFromDOMNode(citation);
            if (!$isCitationNode(node)) return;
            const selection = $createNodeSelection();
            selection.add(node.getKey());
            $setSelection(selection);
          });
          requested.value = { id };
        });
      }),
    );
  },
});

export function useSources() {
  const { output } = useExtensionDependency(SourcesExtension);
  return {
    sources: useSignalValue(output.sources),
    order: useSignalValue(output.order),
    counts: useSignalValue(output.counts),
    activeId: useSignalValue(output.selected),
    add: output.add,
    remove: output.remove,
    cite: output.cite,
    reveal: output.reveal,
    startAdding: output.startAdding,
  };
}
