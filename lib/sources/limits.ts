export const sourceLimits = {
  title: 160,
  content: 200_000,
  textMin: 20,
  bytes: 10 * 1024 * 1024,
  perUser: 100,
  perDocument: 20,
  pageSize: 20,
  searchQuery: 100,
  searchDelay: 300,
  extensions: ["txt", "md", "markdown", "csv", "pdf", "docx"],
} as const;

export function extensionOf(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}
