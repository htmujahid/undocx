export async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", ...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) });
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !data) throw new Error(data?.error ?? "Something went wrong. Try again.");
  return data;
}
