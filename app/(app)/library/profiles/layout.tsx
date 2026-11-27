import { Suspense } from "react";
import { ListFallback } from "../_components/list-pane";
import { SplitLayout } from "../_components/split-layout";
import { ProfilesPane } from "./_components/profiles-pane";
import { listProfiles } from "./actions";

async function ProfilesList() {
  return <ProfilesPane initial={await listProfiles()} />;
}

export default function ProfilesLayout({
  children,
}: LayoutProps<"/library/profiles">) {
  return (
    <SplitLayout
      basePath="/library/profiles"
      list={
        <Suspense fallback={<ListFallback />}>
          <ProfilesList />
        </Suspense>
      }
    >
      {children}
    </SplitLayout>
  );
}
