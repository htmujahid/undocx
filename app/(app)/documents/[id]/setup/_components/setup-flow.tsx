"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { nextQuestion, outlineModes, type BriefAnswers, type BriefQuestion, type OutlineAdvice, type OutlineMode } from "~@/lib/documents/brief";
import { documentLimits } from "~@/lib/documents/limits";
import { customAnswerSchema, type CustomAnswerValues } from "~@/lib/documents/schemas";
import { useGenerateQuestions, useSaveAnswer, useSetOutline, useWriteDraft } from "../query";

type Pick = { label: string; value: string };

function Brief({ prompt, picks }: { prompt: string; picks: Pick[] }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted-foreground">Your brief</span>
      <div className="rounded-md bg-foreground px-4 py-3 text-sm leading-normal whitespace-pre-wrap text-background">{prompt}</div>
      {picks.length > 0 ? (
        <ul aria-label="Your picks" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {picks.map((pick) => (
            <li key={pick.label} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
              {pick.label}: <span className="text-foreground">{pick.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Working({ children }: { children: string }) {
  return (
    <p role="status" className="m-0 flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircleIcon className="size-4 animate-spin" />
      {children}
    </p>
  );
}

function Problem({ message, onRetry, children }: { message: string; onRetry: () => void; children?: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4" role="alert">
      <p className="m-0 text-sm text-destructive">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
        {children}
      </div>
    </div>
  );
}

function QuestionCard({ question, index, total, onAnswer, onSkip, onFinish, isBusy }: { question: BriefQuestion; index: number; total: number; onAnswer: (value: string) => void; onSkip: () => void; onFinish: () => void; isBusy: boolean }) {
  const form = useForm<CustomAnswerValues>({ resolver: zodResolver(customAnswerSchema), defaultValues: { answer: "" } });
  const submit = form.handleSubmit(({ answer }) => {
    form.reset();
    onAnswer(answer);
  });
  return (
    <section aria-labelledby="question-title" className="grid gap-4 rounded-lg border border-border bg-card p-5">
      <div className="grid gap-1">
        <span className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
          Question {index + 1} of {total}
        </span>
        <h2 id="question-title" className="m-0 font-serif text-xl leading-tight font-medium text-foreground">
          {question.question}
        </h2>
      </div>
      {question.choices.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested answers">
          {question.choices.map((choice) => (
            <Button key={choice} variant="secondary" disabled={isBusy} onClick={() => onAnswer(choice)}>
              {choice}
            </Button>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} noValidate className="flex items-start gap-2">
        <InputField control={form.control} name="answer" label="Or answer in your own words" isLabelHidden max={documentLimits.answer} placeholder="Or answer in your own words" fieldClassName="min-w-0 flex-1" />
        <Button type="submit" disabled={isBusy}>
          Answer
        </Button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={onSkip}>
          Skip this question
        </Button>
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={onFinish}>
          Just write it
        </Button>
      </div>
    </section>
  );
}

export function SetupFlow({ id, prompt, picks, questions: initialQuestions, answers: initialAnswers, advice: initialAdvice, outline: initialOutline }: { id: string; prompt: string; picks: Pick[]; questions: BriefQuestion[]; answers: BriefAnswers; advice: OutlineAdvice | null; outline: OutlineMode }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [advice, setAdvice] = useState(initialAdvice);
  const [answers, setAnswers] = useState(initialAnswers);
  const [outline, setOutline] = useState(initialOutline);
  const [isFinished, setIsFinished] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const { trigger: generate, isMutating: isGenerating } = useGenerateQuestions(id);
  const { trigger: writeDraft } = useWriteDraft(id);
  const { trigger: persistAnswer } = useSaveAnswer(id);
  const { trigger: persistOutline } = useSetOutline(id);
  const hasStarted = useRef(false);

  async function loadQuestions() {
    setProblem(null);
    try {
      const result = await generate();
      setQuestions(result.questions);
      setAdvice(result.advice);
      setAnswers({});
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  useEffect(() => {
    if (advice || hasStarted.current) return;
    hasStarted.current = true;
    void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = advice && !isFinished ? nextQuestion(questions, answers) : null;
  const answeredCount = questions.filter((question) => question.id in answers).length;

  function answer(question: BriefQuestion, value: string | null) {
    setAnswers((existing) => ({ ...existing, [question.id]: value }));
    void persistAnswer({ questionId: question.id, answer: value });
  }

  async function write() {
    setProblem(null);
    setIsWriting(true);
    try {
      await persistOutline(outline);
      const result = await writeDraft();
      router.replace(`/documents/${result.id}`);
    } catch (error) {
      setIsWriting(false);
      setProblem(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  async function skipQuestions() {
    setProblem(null);
    setAdvice({ recommended: true, reason: "" });
    setQuestions([]);
  }

  const history = questions.filter((question) => question.id in answers && question !== current);

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
      <div>
        <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">New document</p>
        <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">A few questions, then a first draft.</h1>
      </div>

      <Brief prompt={prompt} picks={picks} />

      {history.length > 0 ? (
        <ol aria-label="Your answers" className="m-0 grid list-none gap-3 p-0">
          {history.map((question) => (
            <li key={question.id} className="grid gap-0.5 text-sm">
              <span className="text-muted-foreground">{question.question}</span>
              <span className={answers[question.id] ? "text-foreground" : "text-faint-foreground italic"}>{answers[question.id] ?? "Skipped"}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {!advice && isGenerating ? <Working>Reading your brief…</Working> : null}
      {!advice && !isGenerating && problem ? (
        <Problem message={problem} onRetry={() => void loadQuestions()}>
          <Button size="sm" variant="ghost" onClick={() => void skipQuestions()}>
            Skip the questions
          </Button>
        </Problem>
      ) : null}

      {current && !isWriting ? <QuestionCard key={current.id} question={current} index={answeredCount} total={questions.length} isBusy={false} onAnswer={(value) => answer(current, value)} onSkip={() => answer(current, null)} onFinish={() => setIsFinished(true)} /> : null}

      {advice && !current && !isWriting ? (
        <section aria-labelledby="outline-title" className="grid gap-4 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-1">
            <h2 id="outline-title" className="m-0 font-serif text-xl leading-tight font-medium text-foreground">
              Should it have an outline?
            </h2>
            <p className="m-0 text-sm leading-normal text-muted-foreground">
              {advice.reason ? `${advice.recommended ? "Undocx suggests one" : "Undocx suggests none"}: ${advice.reason}` : "Undocx decides from the brief."}
            </p>
          </div>
          <SegmentedControl value={outline} onValueChange={(next) => next && setOutline(next as OutlineMode)} aria-label="Outline" className="w-full">
            {outlineModes.map((mode) => (
              <SegmentedControlItem key={mode.value} value={mode.value} className="flex-1 justify-center">
                {mode.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          {problem ? (
            <p className="m-0 text-sm text-destructive" role="alert">
              {problem}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => void write()}>
              Write the first draft
            </Button>
          </div>
        </section>
      ) : null}

      {isWriting ? <Working>Writing your first draft. This takes about a minute…</Working> : null}

      <p className="m-0 text-xs text-muted-foreground">
        Your answers are saved, so you can leave and come back from{" "}
        <Link href="/documents" className="text-foreground underline underline-offset-[0.2em] hover:text-primary-deep">
          your documents
        </Link>
        .
      </p>
    </div>
  );
}
