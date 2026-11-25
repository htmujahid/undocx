export type DocumentSummary = {
  id: string;
  title: string;
  kind: string;
  updated: string;
  words: number;
  locked: number;
  sources: number;
  status: "draft" | "ready";
};

export const documents: DocumentSummary[] = [
  { id: "8f3kq2m", title: "Proposal: a new online store for Marlow & Finch", kind: "Proposal", updated: "Today, 9:31", words: 1090, locked: 2, sources: 3, status: "draft" },
  { id: "k2p9d7v", title: "Q3 report for the Ashby partners", kind: "Report", updated: "Yesterday, 17:02", words: 2410, locked: 4, sources: 6, status: "ready" },
  { id: "t6m1xw3", title: "Case study: how Harbour Books moved online", kind: "Case study", updated: "Monday", words: 860, locked: 0, sources: 2, status: "draft" },
  { id: "c4r8nq5", title: "November newsletter: three shelves, one till", kind: "Newsletter", updated: "14 November", words: 540, locked: 1, sources: 1, status: "ready" },
];

export const newDocumentHref = "/documents/8f3kq2m";

export function documentHref(doc: DocumentSummary) {
  return `/documents/${doc.id}`;
}

export function findDocument(id: string) {
  const key = id.split("-")[0];
  return documents.find((doc) => doc.id === key) ?? documents[0];
}
