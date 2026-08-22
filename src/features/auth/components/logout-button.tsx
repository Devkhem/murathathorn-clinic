"use client";

import { LogOut } from "lucide-react";

import { signOutAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" size="lg" className="gap-2 text-base">
        <LogOut className="size-5" />
        ออกจากระบบ
      </Button>
    </form>
  );
}
