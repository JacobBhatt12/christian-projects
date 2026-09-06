import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "costbridge-admin";

function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : "costbridge-local-admin";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? adminPassword();
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminPassword(value: string) {
  const expected = adminPassword();
  return expected ? safeEqual(hash(value), hash(expected)) : false;
}

export function expectedAdminSession() {
  const secret = sessionSecret();
  return secret ? hash(`costbridge:${secret}`) : null;
}

export async function hasAdminSession() {
  const expected = expectedAdminSession();
  const actual = (await cookies()).get(COOKIE_NAME)?.value;
  return Boolean(expected && actual && safeEqual(actual, expected));
}

export const adminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  },
};
