"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error: string | null;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Sets a password for the currently-signed-in user (must already have a session —
 * established by the /auth/confirm invite/magic-link handler). Needed because our
 * login page only supports email+password; an invited user has no password yet.
 */
export async function setPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "ตั้งรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/");
}
