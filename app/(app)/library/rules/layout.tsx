import { Suspense } from "react";
import { ListFallback } from "../_components/list-pane";
import { SplitLayout } from "../_components/split-layout";
import { RulesPane } from "./_components/rules-pane";
import { listRuleSets } from "./actions";

async function RulesList() {
  return <RulesPane initial={await listRuleSets()} />;
}

export default function RulesLayout({
  children,
}: LayoutProps<"/library/rules">) {
  return (
    <SplitLayout
      basePath="/library/rules"
      list={
        <Suspense fallback={<ListFallback />}>
          <RulesList />
        </Suspense>
      }
    >
      {children}
    </SplitLayout>
  );
}
