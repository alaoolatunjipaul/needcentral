import "server-only";

import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

import {
  createSession,
  createUser,
  deleteSession,
  getSessionByToken,
  getUserByEmail,
  getUserById,
} from "@/lib/auth-data";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "needcentral.session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_TOKEN_BYTES = 32;

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

function toSessionUser(user: {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
  };
}

function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

async function setSessionCookie(sessionToken: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function readSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    const error = new Error("account-exists");
    error.name = "AccountExistsError";
    throw error;
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email,
    name: input.name.trim(),
    passwordHash,
  });

  const sessionToken = generateSessionToken();
  await createSession({
    sessionToken,
    userId: user.id,
    expires: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  });
  await setSessionCookie(sessionToken);

  return toSessionUser(user);
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new Error("invalid-credentials");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("invalid-credentials");
  }

  const sessionToken = generateSessionToken();
  await createSession({
    sessionToken,
    userId: user.id,
    expires: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  });
  await setSessionCookie(sessionToken);

  return toSessionUser(user);
}

export async function getServerSession(): Promise<SessionUser | null> {
  const sessionToken = await readSessionToken();
  if (!sessionToken) return null;

  const session = await getSessionByToken(sessionToken);
  if (!session || session.expires.getTime() <= Date.now()) {
    if (session) await deleteSession(sessionToken);
    await clearSessionCookie();
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    await deleteSession(sessionToken);
    await clearSessionCookie();
    return null;
  }

  return toSessionUser(user);
}

export async function signOut(): Promise<void> {
  const sessionToken = await readSessionToken();
  if (sessionToken) {
    const session = await getSessionByToken(sessionToken);
    if (session) await deleteSession(sessionToken);
  }
  await clearSessionCookie();
}
