import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /editor/[editor]?invite=[shareId]
 * Accept pending invitation and redirect to editor page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ editor: string }> },
) {
  const { editor: documentId } = await params;

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  // If no user, redirect to login with return URL
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // Accept all pending invitations for this user's email
  const { data: acceptedCount } = await client.rpc(
    "accept_pending_invitations",
  );

  console.log(`Accepted ${acceptedCount || 0} pending invitation(s)`);

  // Redirect to the editor page (remove query params)
  const editorUrl = new URL(`/editor/${documentId}`, request.url);
  return NextResponse.redirect(editorUrl);
}
