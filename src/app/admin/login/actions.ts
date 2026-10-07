"use server";

import { redirect } from "next/navigation";
import { authenticate, clearSessionCookie, createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { blockedFor, clientIp, hit, reset } from "@/lib/server/rate-limit";

// Failed sign-ins allowed per 15 minutes, per address and per account.
const WINDOW = 15 * 60_000;
const PER_IP = 10;
const PER_ACCOUNT = 5;

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const ipKey = `login:ip:${await clientIp()}`;
  const accountKey = `login:account:${parsed.data.email.toLowerCase().trim()}`;
  const wait = Math.max(blockedFor(ipKey), blockedFor(accountKey));
  if (wait > 0) {
    return { error: `Too many attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  // Same message for unknown email and wrong password.
  if (!user) {
    hit(ipKey, PER_IP, WINDOW);
    hit(accountKey, PER_ACCOUNT, WINDOW);
    return { error: "Email or password is incorrect" };
  }
  reset(accountKey);

  // Members have no admin pages; letting them in only bounced them in a loop.
  if (user.role === "MEMBER") {
    return { error: "This account has no access to the admin. Ask an administrator for the Technical role." };
  }

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
