import { runIndexJobs } from "~@/lib/retrieval/indexer";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const indexed = await runIndexJobs({ quietSeconds: 60, limit: 25, backfill: true });
  return Response.json({ indexed });
}
