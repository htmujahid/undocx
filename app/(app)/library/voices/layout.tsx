import { Suspense } from "react";
import { ListFallback } from "../_components/list-pane";
import { SplitLayout } from "../_components/split-layout";
import { VoicesPane } from "./_components/voices-pane";
import { listVoices } from "./actions";

async function VoicesList() {
  return <VoicesPane initial={await listVoices()} />;
}

export default function VoicesLayout({
  children,
}: LayoutProps<"/library/voices">) {
  return (
    <SplitLayout
      basePath="/library/voices"
      list={
        <Suspense fallback={<ListFallback />}>
          <VoicesList />
        </Suspense>
      }
    >
      {children}
    </SplitLayout>
  );
}
