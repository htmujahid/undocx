"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~@/components/ui/button";
import { Checkbox, CheckboxGroup } from "~@/components/ui/checkbox";
import { Radio, RadioGroup } from "~@/components/ui/radio";
import { Textarea } from "~@/components/ui/textarea";
import { kindOf, multiSeparator, yesNoChoices, type BriefQuestion, type QuestionKind } from "~@/lib/documents/brief";
import { documentLimits } from "~@/lib/documents/limits";
import { cn } from "~@/lib/utils";

const OTHER = "__other__";

const defaultHints: Record<QuestionKind, string> = {
  single: "Choose one.",
  multi: "Select all that apply.",
  yesno: "Yes or no.",
  text: "Answer in your own words.",
};

const rowClass = "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

export function QuestionCard({ question, index, total, onAnswer, onSkip, onFinish, isBusy }: { question: BriefQuestion; index: number; total: number; onAnswer: (value: string) => void; onSkip: () => void; onFinish: () => void; isBusy: boolean }) {
  const kind = kindOf(question);
  const options = kind === "yesno" ? yesNoChoices : question.choices;
  const isMulti = kind === "multi";
  const [picked, setPicked] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [text, setText] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (index > 0) titleRef.current?.focus();
  }, [index]);

  const typed = other.trim();
  const answer = (() => {
    if (kind === "text") return text.trim() || null;
    const chosen = options.filter((option) => picked.includes(option));
    const extra = picked.includes(OTHER) && typed ? [typed] : [];
    if (isMulti) return [...chosen, ...extra].join(multiSeparator).slice(0, documentLimits.answer) || null;
    return extra[0] ?? (picked.includes(OTHER) ? null : (chosen[0] ?? null));
  })();
  const canContinue = answer !== null && !isBusy;

  function select(next: string[]) {
    setPicked(next);
    if (next.includes(OTHER) && !picked.includes(OTHER)) otherRef.current?.focus();
  }

  function pick(value: string) {
    if (isMulti) select(picked.includes(value) ? picked.filter((item) => item !== value) : [...picked, value]);
    else select([value]);
  }

  function changeOther(value: string) {
    setOther(value);
    if (value.trim()) setPicked((current) => (current.includes(OTHER) ? current : isMulti ? [...current, OTHER] : [OTHER]));
    else setPicked((current) => current.filter((item) => item !== OTHER));
  }

  function submit() {
    if (answer !== null) onAnswer(answer);
  }

  const keys = useRef({ pick, submit, canContinue });
  keys.current = { pick, submit, canContinue };

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || target.closest("[role=dialog], [role=menu], [role=listbox]") || target.matches("input[type=text], textarea, select, a, [role=combobox]")) return;
      const insideForm = target === document.body || Boolean(target.closest("form[aria-labelledby=question-title]"));
      if (!insideForm) return;
      const number = Number(event.key);
      if (kind !== "text" && number >= 1 && number <= options.length) {
        event.preventDefault();
        keys.current.pick(options[number - 1]);
      } else if (event.key === "Enter" && keys.current.canContinue && !target.matches("button:not([role=radio]):not([role=checkbox])")) {
        event.preventDefault();
        keys.current.submit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [kind, options]);

  const otherRow = (control: React.ReactNode) => (
    <label className={cn(rowClass, kind === "yesno" && "sm:col-span-2")}>
      {control}
      <input ref={otherRef} type="text" value={other} maxLength={documentLimits.answer} onChange={(event) => changeOther(event.target.value)} aria-label="Something else" placeholder="Something else…" className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none placeholder:text-faint-foreground" />
    </label>
  );

  const shortcut = (position: number) => (
    <kbd aria-hidden="true" className="ml-auto hidden rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.65rem] leading-none text-faint-foreground sm:inline">
      {position}
    </kbd>
  );

  return (
    <form
      aria-labelledby="question-title"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="grid gap-5 rounded-lg border border-border bg-card p-5"
    >
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Question {index + 1} of {total}
          </span>
          <div role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} className="h-1 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(index / Math.max(total, 1)) * 100}%` }} />
          </div>
        </div>
        <div className="grid gap-1">
          <h2 ref={titleRef} id="question-title" tabIndex={-1} className="m-0 font-serif text-xl leading-tight font-medium text-foreground outline-none">
            {question.question}
          </h2>
          <p className="m-0 text-sm text-muted-foreground">{question.hint ?? defaultHints[kind]}</p>
        </div>
      </div>

      {kind === "text" ? (
        <Textarea autoFocus value={text} onValueChange={setText} maxLength={documentLimits.answer} rows={3} aria-labelledby="question-title" placeholder="Type your answer…" className="min-h-24" />
      ) : isMulti ? (
        <CheckboxGroup aria-labelledby="question-title" value={picked} onValueChange={select} className="grid gap-2">
          {options.map((option, position) => (
            <label key={option} className={rowClass}>
              <Checkbox value={option} />
              <span className="min-w-0">{option}</span>
              {shortcut(position + 1)}
            </label>
          ))}
          {otherRow(<Checkbox value={OTHER} aria-label="Use something else" />)}
        </CheckboxGroup>
      ) : (
        <RadioGroup aria-labelledby="question-title" value={picked[0] ?? null} onValueChange={(value) => select(value ? [value] : [])} className={cn("grid gap-2", kind === "yesno" && "sm:grid-cols-2")}>
          {options.map((option, position) => (
            <label key={option} className={rowClass}>
              <Radio value={option} />
              <span className="min-w-0">{option}</span>
              {shortcut(position + 1)}
            </label>
          ))}
          {otherRow(<Radio value={OTHER} aria-label="Use something else" />)}
        </RadioGroup>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onSkip}>
            Skip this question
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onFinish}>
            Just write it
          </Button>
        </div>
        <Button type="submit" variant="primary" disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </form>
  );
}
