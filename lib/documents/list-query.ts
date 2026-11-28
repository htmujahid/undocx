import { organizeLimits } from "./limits";

export const sortOptions = [
  { value: "updated", label: "Recently edited" },
  { value: "created", label: "Newest first" },
  { value: "title", label: "Title, A to Z" },
  { value: "words", label: "Longest first" },
] as const;

export type DocumentSort = (typeof sortOptions)[number]["value"];

export type ListQuery = { q: string; sort: DocumentSort; folder: string; tag: string | null; page: number };

export const defaultListQuery: ListQuery = { q: "", sort: "updated", folder: "all", tag: null, page: 1 };

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListQuery(params: Params): ListQuery {
  const sort = sortOptions.find((option) => option.value === first(params.sort))?.value ?? defaultListQuery.sort;
  const page = Math.floor(Number(first(params.page)));
  return {
    q: (first(params.q) ?? "").trim().slice(0, organizeLimits.search),
    sort,
    folder: first(params.folder)?.slice(0, 64) || defaultListQuery.folder,
    tag: first(params.tag)?.slice(0, 64) || null,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

export function listHref(current: ListQuery, changes: Partial<ListQuery> = {}) {
  const next = { ...current, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.sort !== defaultListQuery.sort) params.set("sort", next.sort);
  if (next.folder !== defaultListQuery.folder) params.set("folder", next.folder);
  if (next.tag) params.set("tag", next.tag);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `/documents?${search}` : "/documents";
}
