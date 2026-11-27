export const documentTypes = [
  { key: "proposal", label: "Proposal", extra: "Price, decision date, what is out of scope", outline: ["Summary", "What we heard", "Scope", "Timeline", "Investment", "Next steps"] },
  { key: "report", label: "Report", extra: "Period covered, method, who commissioned it", outline: ["Summary", "Method", "Findings", "Risks", "Recommendation", "Appendix"] },
  { key: "article", label: "Article", extra: "Publication, word limit, one takeaway", outline: ["Opening", "The problem", "What changed", "What to do", "Sign-off"] },
  { key: "case-study", label: "Case study", extra: "Client, the before, the measurable after", outline: ["Context", "Problem", "What we did", "Result", "Quote"] },
  { key: "newsletter", label: "Newsletter", extra: "Issue date, the one link that matters", outline: ["Hello", "One story", "Three short items", "The link"] },
] as const;

export type DocumentTypeKey = (typeof documentTypes)[number]["key"];

export function findDocumentType(key: string | null | undefined) {
  return documentTypes.find((type) => type.key === key) ?? null;
}
