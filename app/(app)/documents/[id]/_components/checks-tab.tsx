"use client";

import { SidebarContent } from "~@/components/ui/sidebar";
import { AssistantEdits } from "./assistant-edits";
import { ClaimsChecks } from "./claims-checks";
import { RulesChecks } from "./rules-checks";

export function ChecksTab({ documentId }: { documentId: string }) {
  return (
    <SidebarContent className="gap-6 px-4 py-4">
      <AssistantEdits documentId={documentId} />
      <section aria-labelledby="rules-checks-title" className="grid gap-3">
        <h3 id="rules-checks-title" className="m-0 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
          House rules
        </h3>
        <RulesChecks documentId={documentId} />
      </section>
      <section aria-labelledby="claims-checks-title" className="grid gap-3 border-t border-sidebar-border pt-5">
        <h3 id="claims-checks-title" className="m-0 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
          Claims
        </h3>
        <ClaimsChecks />
      </section>
    </SidebarContent>
  );
}
