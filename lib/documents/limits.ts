export const documentLimits = {
  title: 160,
  prompt: 2000,
  answer: 600,
  questions: 5,
  contentBytes: 4_000_000,
} as const;

export const versionLimits = {
  name: 80,
} as const;

export const organizeLimits = {
  folderName: 40,
  folders: 50,
  tagName: 30,
  tags: 100,
  tagsPerDocument: 10,
  pageSize: 12,
  search: 100,
} as const;
