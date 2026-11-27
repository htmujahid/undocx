import type { EditorThemeClasses } from "lexical";

const checkItem = "relative list-none pl-7 outline-none before:absolute before:top-[0.3em] before:left-0 before:size-4 before:cursor-pointer before:rounded-sm before:border before:content-['']";

export const editorTheme: EditorThemeClasses = {
  paragraph: "text-doc text-foreground",
  heading: {
    h1: "font-serif text-4xl leading-tight font-medium tracking-tight text-foreground",
    h2: "mt-14 scroll-mt-16 font-serif text-2xl font-medium tracking-tight text-foreground first:mt-0",
    h3: "mt-10 font-serif text-xl font-medium tracking-tight text-foreground",
    h4: "mt-8 text-doc font-semibold text-foreground",
    h5: "mt-8 text-doc font-semibold text-foreground",
    h6: "mt-8 text-doc font-semibold text-foreground",
  },
  quote: "border-l-2 border-input pl-4 text-doc text-foreground italic",
  link: "text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary",
  hr: "my-8 h-px cursor-pointer border-0 bg-border outline-none",
  layoutContainer: "my-6 grid gap-4",
  layoutItem: "grid min-w-0 max-w-full content-start gap-4 rounded-sm border border-dashed border-border px-4 py-3",
  table: "my-2 w-full table-auto border-collapse text-sm data-[lexical-row-striping]:[&_tr:nth-child(even)>td]:bg-muted/40",
  tableScrollableWrapper: "overflow-x-auto",
  tableRow: "",
  tableCell: "relative min-w-24 border border-border px-3 py-2 text-left align-top break-words outline-none [&>p]:text-sm",
  tableCellHeader: "bg-muted font-medium",
  tableCellSelected: "caret-transparent after:pointer-events-none after:absolute after:inset-0 after:bg-primary/15 after:content-['']",
  tableSelected: "outline-2 outline-offset-2 outline-ring",
  tableSelection: "[&_*::selection]:bg-transparent",
  mark: "cursor-pointer rounded-xs bg-primary/12 shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_45%,transparent)] data-active:bg-primary/30",
  markOverlap: "bg-primary/20",
  citation: "ml-0.5 cursor-pointer rounded-xs px-0.5 align-super text-[0.65em] leading-none font-medium text-primary hover:bg-primary/10 data-selected:bg-primary/20",
  pageBreak: "relative my-4 block h-px w-full cursor-pointer border-0 border-t border-dashed border-input bg-transparent outline-none after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2 after:bg-card after:px-2 after:font-mono after:text-[0.65rem] after:text-faint-foreground after:content-['Page_break'] data-selected:border-primary data-selected:after:text-primary",
  hrSelected: "bg-primary outline-2 outline-offset-4 outline-ring",
  list: {
    ul: "list-disc pl-6 text-doc text-foreground marker:text-primary",
    ol: "list-decimal pl-6 text-doc text-foreground marker:text-primary marker:tabular-nums",
    olDepth: ["list-decimal", "list-[lower-alpha]", "list-[lower-roman]", "list-decimal", "list-[lower-alpha]"],
    listitem: "my-1",
    listitemUnchecked: `${checkItem} before:border-input before:bg-card`,
    listitemChecked: `${checkItem} text-muted-foreground line-through decoration-1 before:border-primary before:bg-primary after:absolute after:top-[0.45em] after:left-[0.4rem] after:h-[0.55rem] after:w-[0.3rem] after:rotate-45 after:border-r-2 after:border-b-2 after:border-primary-foreground after:content-['']`,
    nested: {
      list: "mt-1",
      listitem: "list-none",
    },
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline underline-offset-4",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through underline-offset-4",
    code: "rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]",
  },
};
