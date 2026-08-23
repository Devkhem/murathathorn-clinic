"use client";

import { useActionState } from "react";

import { setPasswordAction, type AuthActionState } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: AuthActionState = { error: null };

export function SetPasswordForm() {
  const [state, formAction, isPending] = useActionState(setPasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-lg">
          ตั้งรหัสผ่านใหม่
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-14 text-lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword" className="text-lg">
          ยืนยันรหัสผ่าน
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
        {isPending ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
      </Button>
    </form>
  );
}
