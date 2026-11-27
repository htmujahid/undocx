"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon } from "~@/components/ui/icons";
import { Toggle } from "~@/components/ui/toggle";
import { cn } from "~@/lib/utils";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const picks = [
  { id: "profile", label: "Profile", value: "Studio, web design" },
  { id: "voice", label: "Voice", value: "Plain and warm" },
  { id: "rules", label: "Rules", value: "British spelling" },
  { id: "sources", label: "Sources", value: "2 files" },
] as const;

type PickId = (typeof picks)[number]["id"];

type Question = { id: string; prompt: string; choices: string[]; skippedBy?: PickId };

const questions: Question[] = [
  { id: "reader", prompt: "Who will read this?", choices: ["The owner and her bookkeeper", "A board", "Customers"], skippedBy: "profile" },
  { id: "length", prompt: "How long should it be?", choices: ["One page", "Four pages", "Eight pages"] },
  { id: "tone", prompt: "How should it sound?", choices: ["Direct", "Warm", "Formal"], skippedBy: "voice" },
  { id: "price", prompt: "Is the price fixed, or an estimate?", choices: ["Fixed", "An estimate"] },
];

const prompt = "A proposal to Marlow & Finch, a bookshop, to rebuild their online store. Fixed price.";

type Answers = Record<string, string | null>;

export function BriefPlayground() {
  const [active, setActive] = useState<Record<PickId, boolean>>({ profile: true, voice: false, rules: false, sources: false });
  const [stage, setStage] = useState<"setup" | "questions" | "done">("setup");
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const asked = questions.filter((question) => !(question.skippedBy && active[question.skippedBy]));
  const current = asked[step];

  function finish(next: Answers) {
    setAnswers(next);
    setStage("done");
  }

  function answer(value: string | null) {
    const next = { ...answers, [current.id]: value };
    if (step + 1 >= asked.length) finish(next);
    else {
      setAnswers(next);
      setStep(step + 1);
    }
  }

  function reset() {
    setStage("setup");
    setAnswers({});
    setStep(0);
  }

  const answered = asked.filter((question) => answers[question.id]).length;
  const hasOutline = answers.length !== "One page";

  return (
    <Sheet>
      <SheetChrome title="New document">
        <span>{stage === "setup" ? "Choose, then describe" : stage === "questions" ? `Question ${step + 1} of ${asked.length}` : "Brief ready"}</span>
      </SheetChrome>
      <SheetPage className="min-h-80">
        {stage === "setup" ? (
          <div className="grid gap-5">
            <div>
              <p className="m-0 mb-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Optional picks</p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {picks.map((pick) => (
                  <li key={pick.id}>
                    <Toggle pressed={active[pick.id]} onPressedChange={(pressed) => setActive((current) => ({ ...current, [pick.id]: pressed }))} aria-label={`${pick.label}: ${pick.value}`} className={cn("h-auto items-baseline gap-1.5 py-1.5", active[pick.id] && "text-primary data-pressed:bg-primary/10")}>
                      {active[pick.id] ? <CheckIcon className="size-3" /> : null}
                      <span className="font-medium">{pick.label}</span>
                      <span className="text-muted-foreground">{active[pick.id] ? pick.value : "None"}</span>
                    </Toggle>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="m-0 mb-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">What do you need?</p>
              <p className="m-0 rounded-md border border-input bg-background px-3 py-2 font-serif text-lg leading-snug text-foreground">{prompt}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" onClick={() => setStage("questions")}>
                Start
              </Button>
              <span className="text-sm text-muted-foreground">Everything above is optional. Undocx asks for what is missing.</span>
            </div>
          </div>
        ) : null}

        {stage === "questions" && current ? (
          <div className="grid gap-4" aria-live="polite">
            {asked.length < questions.length ? (
              <p className="m-0 text-sm text-primary">
                Skipped {questions.length - asked.length} {questions.length - asked.length === 1 ? "question" : "questions"} your picks already answer.
              </p>
            ) : null}
            <h3 className="m-0 font-serif text-2xl font-medium text-foreground">{current.prompt}</h3>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {current.choices.map((choice) => (
                <li key={choice}>
                  <Button size="sm" onClick={() => answer(choice)}>
                    {choice}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Button size="sm" variant="ghost" onClick={() => answer(null)}>
                Skip
              </Button>
              <Button size="sm" variant="ghost" onClick={() => finish(answers)}>
                Just write it
              </Button>
            </div>
          </div>
        ) : null}

        {stage === "done" ? (
          <div className="grid gap-4">
            <dl className="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {picks
                .filter((pick) => active[pick.id])
                .map((pick) => (
                  <div key={pick.id}>
                    <dt className="m-0 font-serif text-base text-muted-foreground italic">{pick.label}</dt>
                    <dd className="m-0 text-base text-foreground">{pick.value}</dd>
                  </div>
                ))}
              {asked.map((question) => (
                <div key={question.id}>
                  <dt className="m-0 font-serif text-base text-muted-foreground italic">{question.prompt}</dt>
                  <dd className={cn("m-0 text-base", answers[question.id] ? "text-foreground" : "text-faint-foreground")}>{answers[question.id] ?? "Skipped"}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 border-l-2 border-primary/40 pl-3 text-sm leading-normal text-muted-foreground">
              {answered} answered, {asked.length - answered} skipped. {hasOutline ? "Undocx proposes a six-section outline for you to approve." : "A one-page document needs no outline, so it goes straight to a draft."} The editor opens with the first draft ready.
            </p>
            <div>
              <Button size="sm" variant="ghost" onClick={reset}>
                Start again
              </Button>
            </div>
          </div>
        ) : null}
      </SheetPage>
    </Sheet>
  );
}
