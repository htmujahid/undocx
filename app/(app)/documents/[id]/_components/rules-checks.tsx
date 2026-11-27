"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, $isElementNode } from "lexical";
import { useEffect, useState } from "react";
import { Button } from "~@/components/ui/button";
import { OptionSelect } from "~@/components/ui/option-select";
import { $applyReplacements, $findIssues, jumpTo, type Finding } from "~@/editor/extensions/checks";
import { AI_REWRITE_BLOCK_COMMAND, snapshotBlocks, useAiEdits, $plainText, type AiEditBlock } from "~@/editor/extensions/ai-edits";
import { spellingOptions } from "~@/lib/context/limits";
import { findBanned, findSpelling, type SpellingVariant } from "~@/lib/documents/spelling";
import { useRuleChoices, useSetRuleSet } from "../checks/query";

type Results = { spelling: Finding[]; banned: Finding[] };

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : word.endsWith("x") ? `${word}es` : `${word}s`}`;
}

export function RulesChecks({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { add, edits } = useAiEdits();
  const { data, isLoading } = useRuleChoices(documentId);
  const { trigger: setRuleSet } = useSetRuleSet(documentId);
  const [results, setResults] = useState<Results | null>(null);
  const current = data?.current ?? null;
  const variant = (current?.spelling ?? null) as SpellingVariant | null;

  useEffect(() => {
    if (results) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits]);

  function run() {
    if (!current) return;
    const spelling = variant ? editor.read(() => $findIssues((text) => findSpelling(text, variant))) : [];
    const banned = current.banned.length > 0 ? editor.read(() => $findIssues((text) => findBanned(text, current.banned))) : [];
    setResults({ spelling, banned });
  }

  function fixSpelling() {
    const fixable = (results?.spelling ?? []).filter((finding) => !finding.isLocked && finding.replacement);
    if (fixable.length === 0) return;
    const keys = [...new Set(fixable.map((finding) => finding.blockKey))];
    const beforeState = editor.getEditorState();
    const snapshots = snapshotBlocks(editor, keys);
    const beforeTexts = editor.read(() => new Map(keys.map((key) => [key, $plainText($getNodeByKey(key)!)])));
    editor.update(() => void $applyReplacements(fixable.map((finding) => ({ nodeKey: finding.nodeKey, start: finding.start, end: finding.end, replacement: finding.replacement! }))), { discrete: true });
    const blocks: AiEditBlock[] = editor.read(() =>
      keys.flatMap((key) => {
        const node = $getNodeByKey(key);
        const before = snapshots.get(key);
        return node && $isElementNode(node) && before ? [{ key, before, beforeText: beforeTexts.get(key) ?? "", afterText: $plainText(node) }] : [];
      }),
    );
    add({ id: crypto.randomUUID(), label: `${variant ? spellingOptions.find((option) => option.value === variant)?.label : ""} spelling: ${plural(fixable.length, "fix")}`.trim(), status: "applied", blocks, beforeState });
    run();
  }

  if (isLoading || !data) return <p className="m-0 text-sm text-muted-foreground">Loading rules…</p>;

  const counts = current ? [variant ? `${spellingOptions.find((option) => option.value === variant)?.label} spelling` : null, current.banned.length > 0 ? plural(current.banned.length, "banned word") : null, current.formats.length > 0 ? plural(current.formats.length, "format rule") : null, current.custom.length > 0 ? plural(current.custom.length, "other rule") : null].filter(Boolean) : [];
  const fixable = (results?.spelling ?? []).filter((finding) => !finding.isLocked && finding.replacement).length;

  return (
    <div className="grid gap-3">
      <OptionSelect
        label="Rule set for this document"
        hint="From your library. The same rules guide everything Undocx writes here."
        value={current?.id ?? null}
        options={data.ruleSets.map((set) => ({ value: set.id, label: set.name }))}
        notSetLabel="None"
        onChange={(value) => {
          setResults(null);
          void setRuleSet(value);
        }}
      />
      {current ? (
        <>
          <p className="m-0 text-xs leading-normal text-muted-foreground">
            {counts.join(" · ") ? `${counts.join(" · ")}.` : "This rule set is empty."}
            {current.formats.length + current.custom.length > 0 ? " Format and other rules shape what Undocx writes. They are not checked automatically." : ""}
          </p>
          <Button size="sm" variant="secondary" className="justify-self-start" onClick={run}>
            Check rules
          </Button>
        </>
      ) : null}

      {results ? (
        results.spelling.length + results.banned.length === 0 ? (
          <p className="m-0 text-sm text-foreground" role="status">
            No spelling or banned-word problems found.
          </p>
        ) : (
          <div className="grid gap-4">
            {results.spelling.length > 0 ? (
              <section aria-label="Spelling" className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="m-0 text-sm font-medium text-foreground">Spelling · {results.spelling.length}</h4>
                  {fixable > 0 ? (
                    <Button size="sm" variant="primary" onClick={fixSpelling}>
                      Fix {fixable}
                    </Button>
                  ) : null}
                </div>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {results.spelling.map((finding, index) => (
                    <li key={`${finding.nodeKey}-${finding.start}-${index}`} className="flex items-start justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/60">
                      <button type="button" className="min-w-0 cursor-pointer bg-transparent p-0 text-left text-sm text-foreground" onClick={() => jumpTo(editor, finding.blockKey, finding.context.replaceAll("…", ""))}>
                        <span className="text-destructive line-through decoration-1">{finding.text}</span> → <span className="font-medium">{finding.replacement}</span>
                        {finding.isLocked ? <span className="ml-2 text-xs text-muted-foreground">Locked</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {results.banned.length > 0 ? (
              <section aria-label="Banned words" className="grid gap-2">
                <h4 className="m-0 text-sm font-medium text-foreground">Banned words · {results.banned.length}</h4>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {results.banned.map((finding, index) => (
                    <li key={`${finding.nodeKey}-${finding.start}-${index}`} className="grid gap-1 rounded-md border border-border bg-card p-2 text-sm">
                      <p className="m-0 text-muted-foreground">
                        <span className="font-medium text-destructive">“{finding.text}”</span> in: {finding.context}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => jumpTo(editor, finding.blockKey, finding.text)}>
                          Show
                        </Button>
                        {finding.isLocked ? (
                          <span className="self-center text-xs text-muted-foreground">Locked</span>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => editor.dispatchCommand(AI_REWRITE_BLOCK_COMMAND, { key: finding.blockKey, instruction: `Rephrase so the word or phrase "${finding.text}" does not appear, keeping the meaning` })}>
                            Rewrite without it
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
