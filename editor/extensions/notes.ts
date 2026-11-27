import { effect, signal } from "@lexical/extension";
import { $createMarkNode, $getMarkIDs, $isMarkNode, $unwrapMarkNode, $wrapSelectionInMarkNode, MarkExtension, MarkNode } from "@lexical/mark";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $findMatchingParent, mergeRegister, registerNestedElementResolver } from "@lexical/utils";
import {
  $addUpdateTag,
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  defineExtension,
  registerEventListener,
  safeCast,
  SKIP_DOM_SELECTION_TAG,
  type NodeKey,
  type RangeSelection,
} from "lexical";

export type Note = { id: string; quote: string | null; when: string; text: string; isDraft?: boolean };

export const ADD_NOTE_COMMAND = createCommand<NodeKey | undefined>("ADD_NOTE_COMMAND");

function $rangeOfBlock(key: NodeKey): RangeSelection | null {
  const block = $getNodeByKey(key);
  if (!$isElementNode(block)) return null;
  const first = block.getFirstDescendant();
  const last = block.getLastDescendant();
  if (!$isTextNode(first) || !$isTextNode(last)) return null;
  const range = $createRangeSelection();
  range.anchor.set(first.getKey(), 0, "text");
  range.focus.set(last.getKey(), last.getTextContentSize(), "text");
  return range;
}

function $marksOf(id: string) {
  return $nodesOfType(MarkNode).filter((mark) => mark.hasID(id));
}

function $removeMarks(id: string) {
  for (const mark of $marksOf(id)) {
    mark.deleteID(id);
    if (mark.getIDs().length === 0) $unwrapMarkNode(mark);
  }
}

export const NotesExtension = defineExtension({
  name: "undocx/Notes",
  dependencies: [MarkExtension],
  config: safeCast<{ notes: Note[] }>({ notes: [] }),
  build: (editor, config) => {
    const notes = signal<Note[]>(config.notes);
    const requested = signal<{ id: string | null } | null>(null);
    const reveal = (id: string) => {
      let key: string | null = null;
      editor.update(
        () => {
          const mark = $marksOf(id)[0];
          if (!mark) return;
          key = mark.getKey();
          mark.selectStart();
        },
        {
          onUpdate: () => {
            editor.focus();
            if (key) editor.getElementByKey(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
          },
        },
      );
    };
    return {
      notes,
      anchored: signal<ReadonlySet<string>>(new Set()),
      selected: signal<string | null>(null),
      requested,
      addToDocument(text: string) {
        notes.value = [{ id: crypto.randomUUID(), quote: null, when: "Just now", text: text.trim() }, ...notes.peek()];
      },
      show() {
        requested.value = { id: null };
      },
      save(id: string, text: string) {
        notes.value = notes.peek().map((note) => (note.id === id ? { ...note, text: text.trim(), isDraft: false } : note));
      },
      remove(id: string) {
        editor.update(() => $removeMarks(id));
        notes.value = notes.peek().filter((note) => note.id !== id);
      },
      reveal,
    };
  },
  register: (editor, config, state) => {
    const { notes, anchored, selected, requested } = state.getOutput();
    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from) => $createMarkNode(from.getIDs()),
        (from, to) => {
          for (const id of from.getIDs()) to.addID(id);
        },
      ),
      editor.registerCommand(
        ADD_NOTE_COMMAND,
        (blockKey) => {
          const range = blockKey ? $rangeOfBlock(blockKey) : $getSelection();
          if (!$isRangeSelection(range) || (!blockKey && range.isCollapsed())) return false;
          const quote = range.getTextContent().replace(/\s+/g, " ").trim();
          if (!quote) return false;
          const id = crypto.randomUUID();
          const draft = notes.peek().find((note) => note.isDraft);
          if (draft) $removeMarks(draft.id);
          $wrapSelectionInMarkNode(range, range.isBackward(), id);
          $addUpdateTag(SKIP_DOM_SELECTION_TAG);
          notes.value = [{ id, quote, when: "Just now", text: "", isDraft: true }, ...notes.peek().filter((note) => !note.isDraft)];
          requested.value = { id };
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerMutationListener(
        MarkNode,
        () => {
          const next = editor.read("latest", () => new Set($nodesOfType(MarkNode).flatMap((mark) => mark.getIDs())));
          const current = anchored.peek();
          if (current.size !== next.size || [...next].some((id) => !current.has(id))) anchored.value = next;
        },
        { skipInitialization: false },
      ),
      editor.registerUpdateListener(({ editorState }) => {
        selected.value = editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return null;
          const { anchor } = selection;
          const node = anchor.getNode();
          return $isTextNode(node) ? ($getMarkIDs(node, anchor.offset)?.[0] ?? null) : null;
        });
      }),
      editor.registerRootListener((root) => {
        if (!root) return;
        return registerEventListener(root, "click", (event) => {
          const target = event.target;
          if (!(target instanceof Node)) return;
          const id = editor.read(() => {
            const node = $getNearestNodeFromDOMNode(target);
            const mark = node ? $findMatchingParent(node, $isMarkNode) : null;
            return mark?.getIDs()[0] ?? null;
          });
          if (id) requested.value = { id };
        });
      }),
      effect(() => {
        const id = selected.value;
        void anchored.value;
        if (!id) return;
        const elements = editor.read("latest", () => $marksOf(id).map((mark) => editor.getElementByKey(mark.getKey())));
        for (const element of elements) element?.setAttribute("data-active", "");
        return () => {
          for (const element of elements) element?.removeAttribute("data-active");
        };
      }),
    );
  },
});

export function useNotes() {
  const { output } = useExtensionDependency(NotesExtension);
  return {
    notes: useSignalValue(output.notes),
    anchored: useSignalValue(output.anchored),
    activeId: useSignalValue(output.selected),
    show: output.show,
    addToDocument: output.addToDocument,
    save: output.save,
    remove: output.remove,
    reveal: output.reveal,
  };
}
