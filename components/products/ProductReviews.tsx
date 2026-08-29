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
  PenLine,
  Star,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RatingStars } from "@/components/products/RatingStars";
import { RatingSummary } from "@/components/products/RatingSummary";
import { MARKET_CONFIG } from "@/lib/utils";
import type { Review } from "@/types";

const STORAGE_KEY = "needcentral.reviews.v1";
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(MARKET_CONFIG.locale, {
    dateStyle: "long",
  }).format(new Date(iso));
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

function readStoredReviews(): Record<string, Review[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    return parsed as Record<string, Review[]>;
  } catch {
    return {};
  }
}

function writeStoredReviews(data: Record<string, Review[]>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Custom hook: per-product user reviews                             */
/* ------------------------------------------------------------------ */

function useUserReviews(productId: string) {
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  useEffect(() => {
    const all = readStoredReviews();
    // Load localStorage state after hydration to avoid server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserReviews(all[productId] ?? []);
  }, [productId]);

  const addReview = useCallback(
    (review: Omit<Review, "id" | "productId" | "createdAt">) => {
      const next: Review = {
        id: `user-${productId}-${Date.now().toString(36)}`,
        productId,
        createdAt: new Date().toISOString(),
        ...review,
      };

      setUserReviews((prev) => {
        const updated = [next, ...prev];
        const all = readStoredReviews();
        all[productId] = updated;
        writeStoredReviews(all);
        return updated;
      });
    },
    [productId]
  );

  return { userReviews, addReview };
}

/* ------------------------------------------------------------------ */
/*  Keyboard-accessible star rating selector                          */
/* ------------------------------------------------------------------ */

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
}

function StarRatingInput({ value, onChange, invalid }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        onChange(Math.min(5, value + 1));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        onChange(Math.max(1, value - 1));
        break;
      case "Home":
        event.preventDefault();
        onChange(1);
        break;
      case "End":
        event.preventDefault();
        onChange(5);
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      aria-invalid={invalid ? true : undefined}
      className="flex items-center gap-1"
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          className="grid size-9 place-items-center rounded-lg text-zinc-300 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Star
            aria-hidden="true"
            className={`size-6 transition ${
              star <= display ? "fill-amber-400 text-amber-400" : "text-zinc-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Write review form                                                  */
/* ------------------------------------------------------------------ */

interface WriteReviewFormProps {
  productId: string;
  addReview: (
    review: Omit<Review, "id" | "productId" | "createdAt">
  ) => void;
}

function WriteReviewForm({ productId, addReview }: WriteReviewFormProps) {
  const { customer, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const authorName = isAuthenticated && customer ? customer.name : name.trim();
  const titleRemaining = MAX_TITLE_LENGTH - title.length;
  const bodyRemaining = MAX_BODY_LENGTH - body.length;
  const isOverLimit =
    title.length > MAX_TITLE_LENGTH || body.length > MAX_BODY_LENGTH;

  function validate(): string | null {
    if (rating < 1 || rating > 5) return "Please select a star rating.";
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return "Please add a review title.";
    if (trimmedTitle.length > MAX_TITLE_LENGTH)
      return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
    const trimmedBody = body.trim();
    if (!trimmedBody) return "Please write your review.";
    if (trimmedBody.length > MAX_BODY_LENGTH)
      return `Review must be ${MAX_BODY_LENGTH} characters or fewer.`;
    if (!isAuthenticated && !name.trim()) return "Please enter your name.";
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
      addReview({
        author: authorName,
        rating,
        title: title.trim(),
        body: body.trim(),
        location: undefined,
        verifiedPurchase: isAuthenticated,
      });
      setRating(0);
      setTitle("");
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
      aria-label="Write a product review"
    >
      <h3 className="text-base font-semibold text-zinc-900">Write a review</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Share your experience to help other shoppers decide.
      </p>

      <div className="mt-4">
        <span
          id={`review-rating-label-${productId}`}
          className="block text-sm font-medium text-zinc-700"
        >
          Your rating
        </span>
        <div className="mt-1.5">
          <StarRatingInput
            value={rating}
            onChange={(next) => {
              setRating(next);
              if (error) setError(null);
            }}
            invalid={!!error && error.includes("rating")}
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`review-title-${productId}`}
          className="block text-sm font-medium text-zinc-700"
        >
          Title
        </label>
        <input
          id={`review-title-${productId}`}
          type="text"
          maxLength={MAX_TITLE_LENGTH + 20}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Exactly what I needed"
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-describedby={`review-title-hint-${productId}`}
          aria-invalid={!!error && error.includes("title") ? true : undefined}
        />
        <span
          id={`review-title-hint-${productId}`}
          className="mt-1 block text-xs text-zinc-400"
        >
          {titleRemaining >= 0
            ? `${titleRemaining} characters remaining`
            : `${Math.abs(titleRemaining)} characters over limit`}
        </span>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`review-body-${productId}`}
          className="block text-sm font-medium text-zinc-700"
        >
          Your review
        </label>
        <textarea
          id={`review-body-${productId}`}
          rows={4}
          maxLength={MAX_BODY_LENGTH + 50}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Tell others what you liked or what to watch out for."
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-describedby={`review-body-hint-${productId}`}
          aria-invalid={!!error && error.includes("review") ? true : undefined}
        />
        <span
          id={`review-body-hint-${productId}`}
          className="mt-1 block text-xs text-zinc-400"
        >
          {bodyRemaining >= 0
            ? `${bodyRemaining} characters remaining`
            : `${Math.abs(bodyRemaining)} characters over limit`}
        </span>
      </div>

      {!isAuthenticated && (
        <div className="mt-4">
          <label
            htmlFor={`review-name-${productId}`}
            className="block text-sm font-medium text-zinc-700"
          >
            Your name
          </label>
          <input
            id={`review-name-${productId}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Chidinma E."
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            aria-invalid={!!error && error.includes("name") ? true : undefined}
          />
        </div>
      )}

      {isAuthenticated && customer && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-zinc-600">
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
          >
            {customer.name.charAt(0)}
          </span>
          Reviewing as{" "}
          <span className="font-semibold text-zinc-900">{customer.name}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending || isOverLimit || !title.trim() || !body.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <PenLine aria-hidden="true" className="size-4" />
          {isPending ? "Submitting\u2026" : "Submit review"}
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
            to review as a registered customer.
          </span>
        )}
      </div>

      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {error && error}
        {success && "Your review has been submitted."}
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
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Your review has been submitted and appears below.
        </div>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main reviews section                                               */
/* ------------------------------------------------------------------ */

interface ProductReviewsProps {
  productId: string;
  seedReviews: Review[];
  baseRating: number;
  baseReviewCount: number;
}

/**
 * Customer reviews section for the product detail page. Merges seed (mock)
 * reviews with user-submitted reviews persisted in localStorage, updates the
 * aggregate score/count consistently, and includes a submission form with
 * validation, an accessible star selector and live feedback.
 */
export function ProductReviews({
  productId,
  seedReviews,
  baseRating,
  baseReviewCount,
}: ProductReviewsProps) {
  const { userReviews, addReview } = useUserReviews(productId);

  const combinedReviews = [...userReviews, ...seedReviews];

  const baseSum = baseRating * baseReviewCount;
  const userSum = userReviews.reduce((sum, review) => sum + review.rating, 0);
  const combinedCount = baseReviewCount + userReviews.length;
  const combinedRating =
    combinedCount > 0
      ? Math.round(((baseSum + userSum) / combinedCount) * 10) / 10
      : baseRating;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="border-t border-zinc-200 py-12"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="reviews-heading"
          className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
        >
          Customer reviews
        </h2>
        {combinedCount > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold tabular-nums text-zinc-600">
            {combinedCount} {combinedCount === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[20rem_1fr] lg:gap-10">
        <RatingSummary
          rating={combinedRating}
          reviewCount={combinedCount}
          className="h-fit lg:sticky lg:top-24"
        />

        <div>
          <WriteReviewForm productId={productId} addReview={addReview} />

          <div className="mt-6">
            {combinedReviews.length > 0 ? (
              <ul className="space-y-4">
                {combinedReviews.map((review) => {
                  const isUserSubmitted = review.id.startsWith("user-");
                  return (
                    <li
                      key={review.id}
                      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <RatingStars rating={review.rating} />
                        <time
                          dateTime={review.createdAt}
                          className="text-xs tabular-nums text-zinc-400"
                        >
                          {formatDate(review.createdAt)}
                        </time>
                      </div>
                      <h3 className="mt-3 font-semibold text-zinc-900">
                        {review.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-zinc-600">
                        {review.body}
                      </p>
                      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-600">
                          {review.author}
                        </span>
                        {review.location && <span>{review.location}</span>}
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            Verified purchase
                          </span>
                        )}
                        {isUserSubmitted && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700 ring-1 ring-brand-100">
                            Your review
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                No written reviews for this product yet — be the first to share
                your experience.
              </p>
            )}
          </div>

          <p className="mt-5 text-xs leading-5 text-zinc-400">
            Reviews shown are from NeedCentral customers across our global
            community. Submitted reviews appear immediately and are saved on
            this device.
          </p>
        </div>
      </div>
    </section>
  );
}
