import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
};

export const SESSION_COOKIE = "choir_session";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short — set a value of at least 32 characters in .env",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(payload.sub)
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "8h")
    .sign(secretKey());
}

/** Returns the session payload, or null when the token is missing/invalid/expired. */
export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      name: (payload.name as string) ?? "",
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  TECHNICAL: 2,
  ADMIN: 3,
};

export function hasRole(role: Role, required: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required];
}
