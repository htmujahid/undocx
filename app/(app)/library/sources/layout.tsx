import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { listSources } from "~@/lib/db/repository/source";
import { ListFallback } from "../_components/list-pane";
import { SplitLayout } from "../_components/split-layout";
import { SourcesPane } from "./_components/sources-pane";

async function SourcesList() {
  const user = await getCurrentUser();
  return <SourcesPane initial={await listSources(user.id)} />;
}

export default function SourcesLayout({ children }: LayoutProps<"/library/sources">) {
  return (
    <SplitLayout
      basePath="/library/sources"
      list={
        <Suspense fallback={<ListFallback />}>
          <SourcesList />
        </Suspense>
      }
    >
      {children}
    </SplitLayout>
  );
}
