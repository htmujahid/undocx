import { getUserId } from "~@/lib/auth/session";
import { findSource } from "~@/lib/db/repository/source";
import { downloadUrl } from "~@/lib/storage/s3";

export async function GET(_request: Request, { params }: RouteContext<"/library/sources/[id]/file">) {
  const userId = await getUserId();
  if (!userId) return new Response("Sign in to download files.", { status: 401 });
  const { id } = await params;
  const found = await findSource(userId, id);
  if (!found?.asset) return new Response("This file no longer exists.", { status: 404 });
  return Response.redirect(await downloadUrl(found.asset.key, found.asset.filename), 302);
}
