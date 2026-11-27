
export const proposal = {
  title: "Proposal: a new online store for Marlow & Finch",
  outline: [
    ["1", "Summary"],
    ["2", "What we heard"],
    ["3", "Scope of work"],
    ["4", "Timeline"],
    ["5", "Investment"],
    ["6", "Next steps"],
  ],
  locked: ["2", "5"],
  brief: [
    ["Reader", "Ruth Marlow and her bookkeeper"],
    ["Goal", "A yes to a twelve-week rebuild"],
    ["Tone", "Direct and warm"],
    ["Length", "Four pages"],
  ],
} as const;

export const proposalNotes = [
  { id: "n1", quote: "staff picks table by the door", when: "Yesterday", text: "Check with Ruth whether the staff picks table is staying by the door after the refit." },
];

export const proposalSources = [
  { id: "s1", title: "Sales export 2025.xlsx" },
  { id: "s2", title: "Shopify analytics, Jan to Dec 2025" },
  { id: "s3", title: "Staff interview notes.docx" },
];
