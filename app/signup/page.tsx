"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signUpAction } from "@/app/auth/actions";
import { btnPrimary, containerClass, inputBase } from "@/lib/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await signUpAction(name, email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/account");
      router.refresh();
    });
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
              <UserPlus className="size-8" />
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
              <UserPlus className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-950">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Join NeedCentral to track orders, save items and shop smarter.
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
                htmlFor="signup-name"
                className="block text-sm font-medium text-zinc-700"
              >
                Full name
              </label>
              <div className="relative mt-1.5">
                <User
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
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
                  id="signup-email"
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
                htmlFor="signup-password"
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
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label
                htmlFor="signup-confirm"
                className="block text-sm font-medium text-zinc-700"
              >
                Confirm password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="signup-confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <button type="submit" disabled={isPending} className={btnPrimary}>
              {isPending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-brand-700 transition hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
