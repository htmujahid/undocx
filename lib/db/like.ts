export function likePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, "\\$&")}%`;
}
