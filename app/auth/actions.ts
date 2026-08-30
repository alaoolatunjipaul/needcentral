"use server";

import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from "@/lib/auth-service";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

function toMessage(err: unknown, defaultMessage: string): AuthActionResult {
  if (err instanceof Error && err.name === "AccountExistsError") {
    return { ok: false, error: "An account with this email already exists." };
  }
  if (err instanceof Error && err.message === "invalid-credentials") {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: false, error: defaultMessage };
}

export async function signInAction(
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    await authSignIn({ email, password });
    return { ok: true };
  } catch (err) {
    return toMessage(err, "Unable to sign in. Please try again.");
  }
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    await authSignUp({ name, email, password });
    return { ok: true };
  } catch (err) {
    return toMessage(err, "Unable to create your account. Please try again.");
  }
}

export async function signOutAction(): Promise<{ ok: true }> {
  await authSignOut();
  return { ok: true };
}
