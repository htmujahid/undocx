import { createChange, createReorder, definePrimitive, type ChangeDetails, type ReorderDraft, type ReorderReason } from "@ui-sdk/core";

type SortableListOptions = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], details: ChangeDetails<ReorderReason>) => void;
  label?: (key: string) => string | undefined;
};

const sortableList = definePrimitive({
  name: "sortable-list",
  options: {
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    label: "callback",
  },
  controlled: ["value"],
  state: (options: SortableListOptions) => ({
    value: options.value ?? options.defaultValue ?? [],
    moving: null as ReorderDraft | null,
  }),
  sync: (options) => (options.value === undefined ? {} : { value: options.value }),
  api: (context) => {
    const change = createChange(context);
    const reorder = createReorder(context, {
      slot: "item",
      key: "value",
      draft: "moving",
      set: (value, details) => change("value", value, details),
      label: (key) => (context.options().label as SortableListOptions["label"])?.(key),
    });
    return { reorder };
  },
  slots: (slot) => ({
    root: slot<object, { order: string[] }>({
      state: (state, { api }) => ({ order: api.reorder.order(state) }),
    }),
    item: slot<{ value: string }>({
      props: { value: "string" },
      attrs: (state, { key, api }) => ({ "data-grabbed": api.reorder.moving(state, key) ? "" : undefined }),
      bind: (el, part) => part.api.reorder.bind(el, part),
    }),
    handle: slot<{ value: string }>({
      props: { value: { kind: "string", from: "item" } },
      attrs: (state, { key, api }) => ({ type: "button", "aria-pressed": String(api.reorder.moving(state, key)) }),
      on: {
        keydown: (event, { api, key }) => {
          api.reorder.keydown(event, key);
        },
        pointerdown: (event, { api, key }) => api.reorder.pointerdown(event, key),
      },
    }),
  }),
});

export { sortableList, type SortableListOptions };
