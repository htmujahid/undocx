import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../_components/empty-pane";
import { ProfilesList } from "./_components/profiles-list";
import { listProfiles } from "./actions";

export const metadata: Metadata = {
  title: "Writer profiles",
  description: "Who you are, who you write for, and the facts Undocx should rely on.",
};

async function List() {
  return <ProfilesList initial={await listProfiles()} />;
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={<PaneFallback />}>
      <List />
    </Suspense>
  );
}
