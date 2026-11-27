"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { AI_CHECK_CLAIMS_COMMAND, useAiEdits, type ClaimItem, type ClaimStatus } from "~@/editor/extensions/ai-edits";
import { jumpTo } from "~@/editor/extensions/checks";
import { ADD_NOTE_COMMAND } from "~@/editor/extensions/notes";
import { INSERT_CITATION_COMMAND, useSources } from "~@/editor/extensions/sources";
import { cn } from "~@/lib/utils";

const order: ClaimStatus[] = ["contradicted", "unsupported", "unsourced", "uncited", "cited"];

const labels: Record<ClaimStatus, string> = {
  contradicted: "A source says otherwise",
  unsupported: "Source does not support it",
  unsourced: "No source",
  uncited: "Supported, not cited",
  cited: "Cited",
};

export function ClaimsChecks() {
  const [editor] = useLexicalComposerContext();
  const { claims, setClaims, dismissClaim } = useAiEdits();
  const { sources } = useSources();
  const visible = claims.items.filter((item) => !item.isDismissed).sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  const count = (status: ClaimStatus) => visible.filter((item) => item.status === status).length;
  const problems = visible.filter((item) => item.status !== "cited").length;

  function act(item: ClaimItem, kind: "note" | "cite") {
    jumpTo(editor, item.blockKey, item.text, () => {
      if (kind === "note") editor.dispatchCommand(ADD_NOTE_COMMAND, undefined);
      else if (item.sourceId) editor.dispatchCommand(INSERT_CITATION_COMMAND, item.sourceId);
    });
    if (kind === "cite") setClaims({ ...claims, items: claims.items.map((candidate) => (candidate.id === item.id ? { ...candidate, status: "cited" } : candidate)) });
  }

  return (
    <div className="grid gap-3">
      <p className="m-0 text-xs leading-normal text-muted-foreground">Lists the numbers, dates and quotes in the document and checks each against the sources you attached.</p>
      <Button size="sm" variant="secondary" className="justify-self-start" disabled={claims.status === "working"} onClick={() => editor.dispatchCommand(AI_CHECK_CLAIMS_COMMAND, undefined)}>
        {claims.status === "working" ? <LoaderCircleIcon className="animate-spin" /> : null}
        {claims.status === "idle" ? "Check claims" : "Check again"}
      </Button>
      {claims.status === "working" ? (
        <p className="m-0 text-sm text-muted-foreground" role="status">
          Reading the document and its sources…
        </p>
      ) : null}
      {claims.status === "failed" ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {claims.error}
        </p>
      ) : null}
      {claims.status === "done" ? (
        visible.length === 0 ? (
          <p className="m-0 text-sm text-foreground" role="status">
            No claims to check.
          </p>
        ) : (
          <>
            <p className="m-0 text-sm text-muted-foreground" role="status">
              <span className={problems > 0 ? "font-medium text-primary" : undefined}>{problems} to look at</span> · {count("cited")} cited
              {count("uncited") ? ` · ${count("uncited")} supported but not cited` : ""}
            </p>
            <ol aria-label="Claims" className="m-0 grid list-none gap-2 p-0">
              {visible.map((item, index) => {
                const source = sources.find((candidate) => candidate.id === item.sourceId);
                return (
                  <li key={item.id} className="grid gap-1.5 rounded-md border border-border bg-card p-2.5 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="w-4 shrink-0 text-xs tabular-nums text-primary">{index + 1}</span>
                      <p className="m-0 min-w-0 text-foreground">“{item.text}”</p>
                    </div>
                    <p className={cn("m-0 pl-6 text-xs", item.status === "cited" ? "text-muted-foreground" : "font-medium text-primary")}>
                      {labels[item.status]}
                      {source ? <span className="font-normal text-muted-foreground"> · {source.title}</span> : null}
                    </p>
                    {item.note ? <p className="m-0 pl-6 text-xs leading-normal text-muted-foreground">{item.note}</p> : null}
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      <Button size="sm" variant="ghost" onClick={() => jumpTo(editor, item.blockKey, item.text)}>
                        Show
                      </Button>
                      {item.status === "uncited" && item.sourceId ? (
                        <Button size="sm" variant="secondary" onClick={() => act(item, "cite")}>
                          Cite it
                        </Button>
                      ) : null}
                      {item.status === "unsourced" || item.status === "unsupported" || item.status === "contradicted" ? (
                        <Button size="sm" variant="secondary" onClick={() => act(item, "note")}>
                          Add a note
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => dismissClaim(item.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )
      ) : null}
    </div>
  );
}
