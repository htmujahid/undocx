import type { EditorThemeClasses } from "lexical"

export const editorTheme: EditorThemeClasses = {
  heading: {
    h1: "text-2xl font-bold tracking-tight",
    h2: "text-xl font-semibold",
    h3: "text-lg font-semibold",
    h4: "text-base font-medium",
    h5: "text-sm font-medium",
    h6: "text-xs font-medium",
  },
  paragraph: "text-sm leading-relaxed",
  quote: "border-l-4 border-border pl-4 text-sm italic text-muted-foreground",
  list: {
    ul: "list-disc pl-5",
    ol: "list-decimal pl-5",
    nested: {
      listitem: "list-none",
    },
    listitemChecked: "line-through text-muted-foreground",
    listitemUnchecked: "",
  },
  listitem: "my-0.5 text-sm leading-relaxed",
  link: "text-primary underline decoration-primary/50 hover:decoration-primary",
  text: {
    bold: "font-semibold",
    italic: "italic",
    code: "rounded border border-border bg-muted/50 px-1 py-0.5 font-mono text-xs",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
  hashtag: "font-medium text-primary",
  table: "w-full",
  tableRow: "m-0 border-t p-0 even:bg-muted",
  tableRowStriping: "",
  tableCell:
    "border px-4 py-2 text-left whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right [&_p]:my-0",
  tableCellHeader:
    "border px-4 py-2 text-left font-bold whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right [&_p]:my-0",
  tableScrollableWrapper: "my-6 w-full overflow-x-auto",
  tableSelection: "bg-primary/15",
}
