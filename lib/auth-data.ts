import "server-only";

import { db } from "@/lib/db";

// Minimal typed server-side data-access layer for the Project 6 auth
// persistence (User / Account / Session). These are Prisma-based, server-only
// functions that mirror the conventions established in lib/queries.ts (reads)
// and lib/crud.ts (writes). They are intentionally framework-agnostic and are
// NOT wired to any UI, API route, or Server Action yet.
//
// Functions return the Prisma model shapes directly (User, Account, Session)
// so callers can shape their own responses.

// Users -------------------------------------------------------------------

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export type CreateUserInput = {
  email: string;
  name?: string;
  emailVerified?: Date;
  passwordHash?: string;
  image?: string;
};

export async function createUser(input: CreateUserInput) {
  return db.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      emailVerified: input.emailVerified ?? null,
      passwordHash: input.passwordHash ?? null,
      image: input.image ?? null,
    },
  });
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<CreateUserInput, "name" | "email" | "emailVerified" | "passwordHash" | "image">
  >
) {
  return db.user.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name ?? null } : {}),
      ...(patch.email !== undefined ? { email: patch.email } : {}),
      ...(patch.emailVerified !== undefined
        ? { emailVerified: patch.emailVerified ?? null }
        : {}),
      ...(patch.passwordHash !== undefined
        ? { passwordHash: patch.passwordHash ?? null }
        : {}),
      ...(patch.image !== undefined ? { image: patch.image ?? null } : {}),
    },
  });
}

export async function deleteUser(id: string) {
  const result = await db.user.delete({ where: { id } });
  return result;
}

// Accounts ----------------------------------------------------------------

export async function getAccountByProvider(
  provider: string,
  providerAccountId: string
) {
  return db.account.findUnique({
    where: {
      provider_providerAccountId: { provider, providerAccountId },
    },
  });
}

export async function getAccountsByUserId(userId: string) {
  return db.account.findMany({ where: { userId } });
}

export type CreateAccountInput = {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
};

export async function createAccount(input: CreateAccountInput) {
  return db.account.create({
    data: {
      userId: input.userId,
      type: input.type,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      refresh_token: input.refresh_token ?? null,
      access_token: input.access_token ?? null,
      expires_at: input.expires_at ?? null,
      token_type: input.token_type ?? null,
      scope: input.scope ?? null,
      id_token: input.id_token ?? null,
      session_state: input.session_state ?? null,
    },
  });
}

export async function deleteAccount(id: string) {
  return db.account.delete({ where: { id } });
}

// Sessions ----------------------------------------------------------------

export async function getSessionByToken(sessionToken: string) {
  return db.session.findUnique({ where: { sessionToken } });
}

export async function getSessionsByUserId(userId: string) {
  return db.session.findMany({ where: { userId } });
}

export type CreateSessionInput = {
  sessionToken: string;
  userId: string;
  expires: Date;
};

export async function createSession(input: CreateSessionInput) {
  return db.session.create({
    data: {
      sessionToken: input.sessionToken,
      userId: input.userId,
      expires: input.expires,
    },
  });
}

export async function deleteSession(sessionToken: string) {
  return db.session.delete({ where: { sessionToken } });
}

export async function deleteSessionsForUser(userId: string) {
  return db.session.deleteMany({ where: { userId } });
}
