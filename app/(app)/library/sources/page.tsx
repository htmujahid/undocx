import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../_components/empty-pane";
import { SourcesList } from "./_components/sources-list";
import { getCurrentUser } from "~@/lib/auth/session";
import { searchSources } from "~@/lib/db/repository/source";
import { sourceLimits } from "~@/lib/sources/limits";

export const metadata: Metadata = {
  title: "Sources",
  description: "Files, text and links Undocx can read and cite.",
};

async function List() {
  const user = await getCurrentUser();
  return <SourcesList initial={await searchSources(user.id, { limit: sourceLimits.pageSize })} />;
}

export default function SourcesPage() {
  return (
    <Suspense fallback={<PaneFallback />}>
      <List />
    </Suspense>
  );
}
