"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { InputField } from "~@/components/ui/form-fields";
import { type BriefQuestion } from "~@/lib/documents/brief";
import { documentLimits } from "~@/lib/documents/limits";
import { customAnswerSchema, type CustomAnswerValues } from "~@/lib/documents/schemas";

export function QuestionCard({ question, index, total, onAnswer, onSkip, onFinish, isBusy }: { question: BriefQuestion; index: number; total: number; onAnswer: (value: string) => void; onSkip: () => void; onFinish: () => void; isBusy: boolean }) {
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
