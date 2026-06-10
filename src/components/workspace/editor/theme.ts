import type { EditorThemeClasses } from "lexical"

export const editorTheme: EditorThemeClasses = {
  heading: {
    h1: "text-2xl font-bold tracking-tight",
    h2: "text-xl font-semibold",
    h3: "text-lg font-semibold",
    h4: "text-base font-semibold",
    h5: "text-sm font-semibold",
    h6: "text-xs font-semibold",
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
}
