import { MessageCircle, MessageSquare, User } from "lucide-react";
import { MARKET_CONFIG } from "@/lib/utils";
import type { Question } from "@/types";

interface ProductQandAProps {
  questions: Question[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(MARKET_CONFIG.locale, {
    dateStyle: "long",
  }).format(new Date(iso));
}

/**
 * Q&A section for the product detail page. Renders a list of customer
 * questions with their seller answers, or an inviting empty-state prompt
 * when no questions exist yet. Structurally mirrors the existing reviews
 * section for consistency.
 */
export function ProductQandA({ questions }: ProductQandAProps) {
  return (
    <section aria-labelledby="qa-heading" className="border-t border-zinc-200 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="qa-heading"
            className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
          >
            Customer questions
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            See answers from sellers and the community. Ask your own once
            customer accounts arrive.
          </p>
        </div>
        {questions.length > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold tabular-nums text-zinc-600">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
        )}
      </div>

      <div className="mt-7">
        {questions.length > 0 ? (
          <ul className="space-y-4">
            {questions.map((question) => (
              <li
                key={question.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100"
                  >
                    <MessageCircle className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900">
                        {question.body}
                      </p>
                      <time
                        dateTime={question.createdAt}
                        className="shrink-0 text-xs tabular-nums text-zinc-400"
                      >
                        {formatDate(question.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400">
                      <User aria-hidden="true" className="size-3" />
                      Asked by {question.author}
                    </p>

                    {question.answers.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                            >
                              <MessageSquare className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-6 text-zinc-600">
                                {answer.body}
                              </p>
                              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-400">
                                <span className="font-semibold text-zinc-600">
                                  {answer.author}
                                </span>
                                <span aria-hidden="true">·</span>
                                <time dateTime={answer.createdAt}>
                                  {formatDate(answer.createdAt)}
                                </time>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
            <span
              aria-hidden="true"
              className="mx-auto grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400"
            >
              <MessageCircle className="size-6" />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-900">
              No questions yet
            </p>
            <p className="mt-1 max-w-sm mx-auto text-sm leading-6 text-zinc-500">
              Be the first to ask about this product — customer accounts and
              question submissions are coming soon.
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-zinc-400">
        Questions and answers shown are from recent customer interactions
        across NeedCentral. A public question submission form will be
        available with customer accounts.
      </p>
    </section>
  );
}
