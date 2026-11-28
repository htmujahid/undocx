import type { Metadata } from "next";
import { Suspense } from "react";
import { PaneFallback } from "../../_components/empty-pane";
import { SourceContent } from "../_components/source-content";

export const metadata: Metadata = { title: "Source" };

async function Body({ params }: Pick<PageProps<"/library/sources/[id]">, "params">) {
  const { id } = await params;
  return <SourceContent id={id} />;
}

export default function SourcePage({ params }: PageProps<"/library/sources/[id]">) {
  return (
    <Suspense fallback={<PaneFallback />}>
      <Body params={params} />
    </Suspense>
  );
}
