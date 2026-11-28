"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, LoaderCircleIcon, LockIcon, LockOpenIcon, RefreshCwIcon, Undo2Icon } from "~@/components/ui/icons";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { cn } from "~@/lib/utils";
import { Caret, DocHeading, Instruction, SectionLabel, Sheet, SheetChrome, SheetPage, paragraphClass } from "./doc";

type Stage = "brief" | "outline" | "draft";

type Paragraph = {
  id: string;
  text: string;
  isLocked?: boolean;
  variants?: { instruction: string; text: string }[];
};

type ParagraphState = Paragraph & {
  status: "idle" | "streaming" | "done";
  cursor: number;
  history: string[];
  lastInstruction?: string;
  notice?: string;
};

const title = "Proposal: a new online store for Marlow & Finch";

const brief = [
  { question: "Who will read this?", answer: "Ruth Marlow, the owner, and her bookkeeper. Neither is technical." },
  { question: "What should it achieve?", answer: "Get a yes to a three-month rebuild of the shop's checkout and catalogue." },
  { question: "Tone?", answer: "Direct and warm. Numbers first, no jargon." },
  { question: "Length?", answer: "Four pages. Ruth reads on paper." },
];

const outline = [
  { number: "1", title: "Summary", note: "The yes we are asking for, in six lines." },
  { number: "2", title: "What we heard", note: "Three visits, two staff interviews, one afternoon on the till." },
  { number: "3", title: "Scope of work", note: "Checkout, catalogue, order emails. What is out." },
  { number: "4", title: "Timeline", note: "Twelve weeks, three checkpoints." },
  { number: "5", title: "Investment", note: "One fixed price, two payments." },
  { number: "6", title: "Next steps", note: "What happens when Ruth signs." },
];

const draft: Paragraph[] = [
  {
    id: "p1",
    isLocked: true,
    text: "Marlow & Finch has sold books on Bridge Street since 1987. Last year, 41% of orders came through the website, up from 12% in 2019, and the site has not changed since then.",
  },
  {
    id: "p2",
    text: "The current checkout takes six steps and loses roughly a third of customers between the basket and payment. We propose rebuilding it as a two-step flow, with guest checkout and saved addresses, and measuring the drop-off at each step from launch.",
    variants: [
      {
        instruction: "Lead with the customer",
        text: "A customer who has found the right book still has six screens to get through before paying, and about one in three gives up on the way. We will cut the checkout to two steps, allow guest purchases, and track where people leave from the first day.",
      },
      { instruction: "Shorter", text: "A third of customers abandon the six-step checkout. We will rebuild it as two steps with guest checkout, and measure the drop-off from launch." },
      {
        instruction: "Plainer, for a non-technical reader",
        text: "Right now, paying for a book takes six screens, and about one customer in three leaves before the end. We will bring that down to two screens, let people pay without creating an account, and watch the numbers so we know it worked.",
      },
    ],
  },
  {
    id: "p3",
    text: "Alongside the checkout, we will move the catalogue to a search-first layout, so a customer who knows the title finds it in one step, and one who does not can browse by shelf as they would in the shop.",
    variants: [
      {
        instruction: "Mention the staff picks table",
        text: "Alongside the checkout, we will move the catalogue to a search-first layout. A customer who knows the title finds it in one step; one who does not can browse by shelf, starting with the staff picks table that sits by the door.",
      },
      { instruction: "Shorter", text: "We will also rebuild the catalogue around search, with browsing by shelf for customers who want to wander." },
    ],
  },
];

const STREAM_STEP_MS = 28;

function StreamingText({ text, isStreaming, onDone }: { text: string; isStreaming: boolean; onDone: () => void }) {
  const words = text.split(" ");
  const [shown, setShown] = useState(() => {
    if (!isStreaming) return words.length;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return words.length;
    return 0;
  });

  useEffect(() => {
    if (!isStreaming) return;
    if (shown >= words.length) {
      onDone();
      return;
    }
    const timer = window.setTimeout(() => setShown((n) => n + 1), STREAM_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [isStreaming, shown, words.length, onDone]);

  const isLive = isStreaming && shown < words.length;
  return (
    <>
      <span className={cn(isStreaming && "animate-fade-in motion-reduce:animate-none")}>{words.slice(0, shown).join(" ")}</span>
      {isLive ? <Caret /> : null}
    </>
  );
}

function IconAction({ label, tip, onClick, className, disabled, children }: { label: string; tip: string; onClick: () => void; className?: string; disabled?: boolean; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger aria-label={label} aria-disabled={disabled || undefined} onClick={disabled ? undefined : onClick} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), disabled && "opacity-40", className)}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

function ParagraphBlock({
  paragraph,
  index,
  onRegenerate,
  onToggleLock,
  onUndo,
  onStreamDone,
}: {
  paragraph: ParagraphState;
  index: number;
  onRegenerate: () => void;
  onToggleLock: () => void;
  onUndo: () => void;
  onStreamDone: () => void;
}) {
  const labelId = useId();
  const isStreaming = paragraph.status === "streaming";
  return (
    <div role="group" aria-labelledby={labelId} className="mb-5 grid grid-cols-1 items-start gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto]">
      <span id={labelId} hidden>
        Paragraph {index + 1}
        {paragraph.isLocked ? ", locked" : ""}
      </span>
      <div className="min-w-0">
        {paragraph.lastInstruction ? <Instruction label="Rewrote with">{paragraph.lastInstruction}</Instruction> : null}
        <p aria-live={isStreaming ? "off" : "polite"} className={paragraphClass}>
          <StreamingText key={paragraph.text} text={paragraph.text} isStreaming={isStreaming} onDone={onStreamDone} />
        </p>
        {paragraph.notice ? (
          <p role="status" className="m-0 text-sm text-primary">
            {paragraph.notice}
          </p>
        ) : null}
      </div>
      <div className="flex gap-0.5 sm:justify-end sm:pt-0.5">
        {paragraph.history.length > 0 ? (
          <IconAction label="Undo rewrite" tip="Undo" onClick={onUndo}>
            <Undo2Icon />
          </IconAction>
        ) : null}
        <IconAction label={paragraph.isLocked ? "Unlock paragraph" : "Lock paragraph"} tip={paragraph.isLocked ? "Final. Rewrites skip this paragraph." : "Lock as final"} onClick={onToggleLock} className={paragraph.isLocked ? "bg-primary/10 text-primary hover:bg-primary/15" : undefined}>
          {paragraph.isLocked ? <LockIcon /> : <LockOpenIcon />}
        </IconAction>
        <IconAction label="Regenerate paragraph" tip={isStreaming ? "Writing…" : "Regenerate"} onClick={onRegenerate} disabled={isStreaming} className="text-primary">
          {isStreaming ? <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" /> : <RefreshCwIcon />}
        </IconAction>
      </div>
    </div>
  );
}

export function EditorMock() {
  const [stage, setStage] = useState<Stage>("draft");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [order, setOrder] = useState(() => outline.map((item) => item.number));
  const [paragraphs, setParagraphs] = useState<ParagraphState[]>(() => draft.map((p) => ({ ...p, status: "idle", cursor: 0, history: [] })));

  function update(id: string, change: (p: ParagraphState) => ParagraphState) {
    setParagraphs((list) => list.map((p) => (p.id === id ? change(p) : p)));
  }

  function regenerate(id: string) {
    update(id, (p) => {
      if (p.isLocked) return { ...p, notice: "Locked. Unlock it first if you want it rewritten." };
      if (!p.variants || p.variants.length === 0 || p.status === "streaming") return p;
      const variant = p.variants[p.cursor % p.variants.length];
      return { ...p, text: variant.text, lastInstruction: variant.instruction, cursor: p.cursor + 1, history: [...p.history, p.text], status: "streaming", notice: undefined };
    });
  }

  function undo(id: string) {
    update(id, (p) => {
      const previous = p.history[p.history.length - 1];
      if (previous === undefined) return p;
      return { ...p, text: previous, history: p.history.slice(0, -1), status: "idle", lastInstruction: undefined, notice: undefined };
    });
  }

  function toggleLock(id: string) {
    update(id, (p) => ({ ...p, isLocked: !p.isLocked, notice: undefined }));
  }

  function move(number: string, delta: -1 | 1) {
    setOrder((current) => {
      const from = current.indexOf(number);
      const to = from + delta;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      next.splice(from, 1);
      next.splice(to, 0, number);
      return next;
    });
  }

  const lockedCount = paragraphs.filter((p) => p.isLocked).length;
  const wordCount = paragraphs.reduce((n, p) => n + p.text.split(" ").length, 0);

  return (
    <Sheet>
      <SheetChrome title={title}>
        <SegmentedControl aria-label="Stage" value={stage} onValueChange={(value) => value && setStage(value as Stage)}>
          <SegmentedControlItem value="brief">Brief</SegmentedControlItem>
          <SegmentedControlItem value="outline">Outline</SegmentedControlItem>
          <SegmentedControlItem value="draft">Draft</SegmentedControlItem>
        </SegmentedControl>
        <Button size="sm" onClick={() => setIsExportOpen((open) => !open)} aria-expanded={isExportOpen}>
          <DownloadIcon />
          Export
        </Button>
      </SheetChrome>

      <SheetPage className="sm:min-h-[30rem]">
        {stage === "brief" ? (
          <>
            <SectionLabel>Brief</SectionLabel>
            <DocHeading>What you asked for, and what it asked back</DocHeading>
            <dl className="m-0 grid max-w-measure grid-cols-1 gap-y-1 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-4">
              {brief.map((row) => (
                <div key={row.question} className="contents">
                  <dt className="m-0 font-serif text-lg text-muted-foreground italic">{row.question}</dt>
                  <dd className="m-0 mb-3 border-b border-border pb-2 sm:mb-0">{row.answer}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 mt-4 max-w-measure text-sm text-muted-foreground">The questions were made for this document. Your answers shape the outline and every section after it. Change one later and choose whether to re-run.</p>
          </>
        ) : null}

        {stage === "outline" ? (
          <>
            <SectionLabel>Outline</SectionLabel>
            <DocHeading>Six sections, in the order you choose</DocHeading>
            <ol className="m-0 max-w-measure list-none p-0">
              {order.map((number, position) => {
                const item = outline.find((entry) => entry.number === number)!;
                return (
                  <li key={number} className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3 border-b border-border py-2 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
                    <span className="font-serif text-lg tabular-nums text-primary">{position + 1}</span>
                    <span>
                      <p className="m-0 font-serif text-lg leading-snug font-medium">{item.title}</p>
                      <p className="m-0 text-sm text-muted-foreground">{item.note}</p>
                    </span>
                    <span className="col-start-2 mt-1 flex gap-0.5 sm:col-start-auto sm:mt-0 sm:justify-end">
                      <Button variant="ghost" size="icon" aria-label={`Move ${item.title} up`} disabled={position === 0} onClick={() => move(number, -1)}>
                        <ArrowUpIcon />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Move ${item.title} down`} disabled={position === order.length - 1} onClick={() => move(number, 1)}>
                        <ArrowDownIcon />
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="m-0 mt-4 max-w-measure text-sm text-muted-foreground">Approve the outline and each section is written in turn, with the ones before it in view.</p>
          </>
        ) : null}

        {stage === "draft" ? (
          <>
            <SectionLabel number="2">of 6</SectionLabel>
            <DocHeading>What we heard</DocHeading>
            {paragraphs.map((paragraph, index) => (
              <ParagraphBlock
                key={paragraph.id}
                paragraph={paragraph}
                index={index}
                onRegenerate={() => regenerate(paragraph.id)}
                onToggleLock={() => toggleLock(paragraph.id)}
                onUndo={() => undo(paragraph.id)}
                onStreamDone={() => update(paragraph.id, (p) => (p.status === "streaming" ? { ...p, status: "done" } : p))}
              />
            ))}
          </>
        ) : null}
      </SheetPage>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm text-muted-foreground sm:px-5">
        {isExportOpen ? (
          <ul aria-label="Export formats" className="m-0 flex list-none flex-wrap gap-3 p-0">
            <li>Word (.docx)</li>
            <li>PDF</li>
            <li>Markdown</li>
            <li>OpenDocument</li>
          </ul>
        ) : (
          <span>
            {wordCount} words · {lockedCount} locked {lockedCount === 1 ? "passage" : "passages"}
          </span>
        )}
        <span>Locked text is never rewritten.</span>
      </div>
    </Sheet>
  );
}
