"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "~@/components/ui/button";
import { ChoiceRow, ChoiceShortcut, useChoiceShortcuts } from "~@/components/ui/choice-row";
import { Radio, RadioGroup } from "~@/components/ui/radio";
import { nextQuestion, outlineModes, type BriefAnswers, type BriefQuestion, type OutlineAdvice, type OutlineMode } from "~@/lib/documents/brief";
import { useGenerateQuestions, useSaveAnswer, useSetOutline, useWriteDraft } from "../query";
import { Brief, type BriefPick } from "./setup-brief";
import { Working } from "./setup-working";
import { Problem } from "./setup-problem";
import { QuestionCard } from "./question-card";

export function SetupFlow({ id, prompt, picks, questions: initialQuestions, answers: initialAnswers, advice: initialAdvice, outline: initialOutline }: { id: string; prompt: string; picks: BriefPick[]; questions: BriefQuestion[]; answers: BriefAnswers; advice: OutlineAdvice | null; outline: OutlineMode }) {
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
        <OutlineChoice advice={advice} outline={outline} onOutline={setOutline} problem={problem} onWrite={() => void write()} />
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

function OutlineChoice({ advice, outline, onOutline, problem, onWrite }: { advice: OutlineAdvice; outline: OutlineMode; onOutline: (mode: OutlineMode) => void; problem: string | null; onWrite: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  useChoiceShortcuts({ scope: formRef, count: outlineModes.length, onPick: (position) => onOutline(outlineModes[position].value), onSubmit: onWrite, canSubmit: true });
  return (
    <form
      ref={formRef}
      aria-labelledby="outline-title"
      onSubmit={(event) => {
        event.preventDefault();
        onWrite();
      }}
      className="grid gap-5 rounded-lg border border-border bg-card p-5"
    >
      <div className="grid gap-1">
        <span className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Last step</span>
        <h2 id="outline-title" className="m-0 font-serif text-xl leading-tight font-medium text-foreground">
          Should it have an outline?
        </h2>
        <p className="m-0 text-sm leading-normal text-muted-foreground">{advice.reason ? `${advice.recommended ? "Undocx suggests one" : "Undocx suggests none"}: ${advice.reason}` : "Choose how the first draft is structured."}</p>
      </div>
      <RadioGroup aria-labelledby="outline-title" value={outline} onValueChange={(value) => value && onOutline(value as OutlineMode)} className="grid gap-2">
        {outlineModes.map((mode, position) => (
          <ChoiceRow key={mode.value}>
            <Radio value={mode.value} />
            <span className="grid min-w-0 gap-0.5">
              <span>{mode.label}</span>
              <span className="text-xs text-muted-foreground">{mode.value === "auto" ? `${mode.description} It would ${advice.recommended ? "use" : "skip"} one here.` : mode.description}</span>
            </span>
            <ChoiceShortcut>{position + 1}</ChoiceShortcut>
          </ChoiceRow>
        ))}
      </RadioGroup>
      {problem ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" variant="primary">
          Write the first draft
        </Button>
      </div>
    </form>
  );
}
