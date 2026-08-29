"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MARKET_CONFIG } from "@/lib/utils";
import type { Question } from "@/types";

const STORAGE_KEY = "needcentral.questions.v1";
const MAX_BODY_LENGTH = 1000;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(MARKET_CONFIG.locale, {
    dateStyle: "long",
  }).format(new Date(iso));
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

function readStoredQuestions(): Record<string, Question[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    )
      return {};
    return parsed as Record<string, Question[]>;
  } catch {
    return {};
  }
}

function writeStoredQuestions(data: Record<string, Question[]>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Custom hook: per-product user questions                            */
/* ------------------------------------------------------------------ */

function useUserQuestions(productId: string) {
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const all = readStoredQuestions();
    // Load localStorage state after hydration to avoid server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserQuestions(all[productId] ?? []);
  }, [productId]);

  const addQuestion = useCallback(
    (body: string, author: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      const question: Question = {
        id: `user-${productId}-${Date.now().toString(36)}`,
        productId,
        author: author.trim(),
        body: trimmed,
        createdAt: new Date().toISOString(),
        answers: [],
      };

      setUserQuestions((prev) => {
        const next = [question, ...prev];
        const all = readStoredQuestions();
        all[productId] = next;
        writeStoredQuestions(all);
        return next;
      });
    },
    [productId]
  );

  return { userQuestions, addQuestion };
}

/* ------------------------------------------------------------------ */
/*  Ask question form                                                  */
/* ------------------------------------------------------------------ */

interface AskQuestionFormProps {
  productId: string;
  addQuestion: (body: string, author: string) => void;
}

function AskQuestionForm({ productId, addQuestion }: AskQuestionFormProps) {
  const { customer, isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const authorName = isAuthenticated && customer ? customer.name : name.trim();
  const remaining = MAX_BODY_LENGTH - body.length;
  const isOverLimit = remaining < 0;

  function validate(): string | null {
    const trimmed = body.trim();
    if (!trimmed) return "Please enter your question.";
    if (trimmed.length > MAX_BODY_LENGTH) {
      return `Question must be ${MAX_BODY_LENGTH} characters or fewer.`;
    }
    if (!isAuthenticated && !name.trim()) {
      return "Please enter your name.";
    }
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(() => {
      addQuestion(body, authorName);
      setBody("");
      if (!isAuthenticated) setName("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
      aria-label="Ask a question about this product"
    >
      <h3 className="text-base font-semibold text-zinc-900">
        Ask a question
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Your question will appear on this product page for other customers and
        the seller to answer.
      </p>

      <div className="mt-4">
        <label
          htmlFor={`qa-body-${productId}`}
          className="block text-sm font-medium text-zinc-700"
        >
          Your question
        </label>
        <textarea
          id={`qa-body-${productId}`}
          rows={3}
          maxLength={MAX_BODY_LENGTH + 50}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Is this available in other colours?"
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-describedby={`qa-body-hint-${productId}`}
          aria-invalid={
            !!error && error.includes("question") ? true : undefined
          }
        />
        <div className="mt-1 flex items-center justify-between">
          <span
            id={`qa-body-hint-${productId}`}
            className="text-xs text-zinc-400"
          >
            {remaining >= 0
              ? `${remaining} characters remaining`
              : `${Math.abs(remaining)} characters over limit`}
          </span>
          {isOverLimit && (
            <span className="text-xs font-medium text-rose-600">Too long</span>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mt-3">
          <label
            htmlFor={`qa-name-${productId}`}
            className="block text-sm font-medium text-zinc-700"
          >
            Your name
          </label>
          <input
            id={`qa-name-${productId}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Chidinma E."
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            aria-invalid={
              !!error && error.includes("name") ? true : undefined
            }
          />
        </div>
      )}

      {isAuthenticated && customer && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-600">
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
          >
            {customer.name.charAt(0)}
          </span>
          Asking as{" "}
          <span className="font-semibold text-zinc-900">{customer.name}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending || isOverLimit || !body.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <Send aria-hidden="true" className="size-4" />
          {isPending ? "Submitting\u2026" : "Submit question"}
        </button>

        {!isAuthenticated && (
          <span className="text-xs text-zinc-400">
            Or{" "}
            <a
              href="/signin"
              className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 transition hover:text-brand-700 hover:decoration-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              sign in
            </a>{" "}
            to ask as a registered customer.
          </span>
        )}
      </div>

      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {error && error}
        {success && "Your question has been submitted."}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          Your question has been submitted and appears below.
        </div>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Q&A section                                                   */
/* ------------------------------------------------------------------ */

interface ProductQandAProps {
  productId: string;
  seedQuestions: Question[];
}

/**
 * Q&A section for the product detail page. Merges seed (mock) questions
 * with user-submitted questions persisted in localStorage. Includes a
 * submission form with validation, auth integration and live feedback.
 */
export function ProductQandA({ productId, seedQuestions }: ProductQandAProps) {
  const { userQuestions, addQuestion } = useUserQuestions(productId);

  // User questions appear first (newest first), then seed questions.
  const allQuestions = [...userQuestions, ...seedQuestions];
  const userQuestionCount = userQuestions.length;

  return (
    <section
      aria-labelledby="qa-heading"
      className="border-t border-zinc-200 py-12"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="qa-heading"
            className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
          >
            Customer questions
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            See answers from sellers and the community, or ask your own
            question about this product.
          </p>
        </div>
        {allQuestions.length > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold tabular-nums text-zinc-600">
            {allQuestions.length}{" "}
            {allQuestions.length === 1 ? "question" : "questions"}
          </span>
        )}
      </div>

      <div className="mt-7 space-y-6">
        <AskQuestionForm productId={productId} addQuestion={addQuestion} />

        {allQuestions.length > 0 ? (
          <ul className="space-y-4">
            {allQuestions.map((question) => {
              const isUserSubmitted = question.id.startsWith("user-");
              return (
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
                        {isUserSubmitted && userQuestionCount > 0 && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
                            Your question
                          </span>
                        )}
                      </p>

                      {question.answers.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
                          {question.answers.map((answer) => (
                            <div
                              key={answer.id}
                              className="flex items-start gap-3"
                            >
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
              );
            })}
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
            <p className="mt-1 mx-auto max-w-sm text-sm leading-6 text-zinc-500">
              Be the first to ask about this product — your question will
              help other customers too.
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-zinc-400">
        Questions and answers shown are from recent customer interactions
        across NeedCentral. Seller answers typically arrive within 24 hours.
      </p>
    </section>
  );
}
