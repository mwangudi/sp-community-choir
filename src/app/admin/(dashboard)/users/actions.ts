"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role, Voice } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, requireSession } from "@/lib/auth";

export type UserFormState = { error?: string };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

/** Refuses a change that would leave nobody able to administer the site. */
async function wouldStrandTheSite(userId: string, role: Role, isActive: boolean) {
  if (role === "ADMIN" && isActive) return false;
  const others = await prisma.user.count({
    where: { role: "ADMIN", isActive: true, NOT: { id: userId } },
  });
  return others === 0;
}

export async function saveUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireSession("ADMIN");

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "A name is required" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address" };
  }

  const clash = await prisma.user.findFirst({
    where: { email, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: "Someone already signs in with that address" };

  const role = String(formData.get("role") ?? "MEMBER") as Role;
  const isActive = formData.get("isActive") === "on";
  const password = String(formData.get("password") ?? "");

  if (id === session.sub && (role !== "ADMIN" || !isActive)) {
    return { error: "You cannot remove your own admin access" };
  }
  if (id && (await wouldStrandTheSite(id, role, isActive))) {
    return { error: "This is the last active admin — promote someone else first" };
  }

  const data = {
    name,
    email,
    role,
    isActive,
    voice: (text(formData, "voice") as Voice | null) ?? null,
  };

  if (id) {
    if (password && password.length < 10) {
      return { error: "A new password needs at least 10 characters" };
    }
    await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
  } else {
    if (password.length < 10) {
      return { error: "Set a password of at least 10 characters" };
    }
    await prisma.user.create({
      data: { ...data, passwordHash: await hashPassword(password) },
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireSession("ADMIN");
  const id = String(formData.get("id"));

  if (id === session.sub) return;
  if (await wouldStrandTheSite(id, "MEMBER", false)) return;

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/users");
}
