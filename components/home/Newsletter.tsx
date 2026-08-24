"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail } from "lucide-react";

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <Mail aria-hidden="true" className="size-7" />
        </span>
        <h2
          id="newsletter-heading"
          className="mt-5 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
        >
          Join the insider list
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
          Early access to drops, member-only deals and one genuinely useful email a week. No spam, ever.
        </p>

        {subscribed ? (
          <p
            role="status"
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200"
          >
            <CheckCircle2 aria-hidden="true" className="size-5" />
            You’re on the list — welcome aboard!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full flex-1 rounded-full border border-zinc-300 px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
