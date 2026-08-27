"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { btnPrimary, containerClass, inputBase } from "@/lib/ui";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = signIn(email, password);
    if (result) {
      setError(result);
      return;
    }
    router.push("/account");
  }

  if (isAuthenticated) {
    return (
      <div className={containerClass}>
        <div className="mx-auto max-w-md py-16 sm:py-24">
          <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-zinc-200">
            <span
              aria-hidden="true"
              className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-500"
            >
              <LogIn className="size-8" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-zinc-900">
              You are already signed in
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Head to your account to manage your profile, orders and saved
              items.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/account" className={btnPrimary}>
                Go to account
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:ring-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="mx-auto max-w-md py-12 sm:py-20">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"
            >
              <LogIn className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-950">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Sign in to access your account, orders and saved items.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="signin-email"
                className="block text-sm font-medium text-zinc-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="signin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputBase} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={btnPrimary}>
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            No account yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand-700 transition hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
            <p className="text-xs font-medium text-zinc-500">
              Demo account:{" "}
              <span className="font-semibold text-zinc-700">
                chiamaka@example.com
              </span>{" "}
              /{" "}
              <span className="font-semibold text-zinc-700">
                password123
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
