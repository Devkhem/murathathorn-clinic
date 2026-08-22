"use client";

import { useActionState } from "react";

import { signInAction, type AuthActionState } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: AuthActionState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-lg">
          อีเมล
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-14 text-lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-lg">
          รหัสผ่าน
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-14 text-lg"
        />
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="h-14 text-lg" disabled={isPending}>
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
