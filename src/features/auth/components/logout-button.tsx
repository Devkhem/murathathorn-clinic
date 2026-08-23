"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * Logout requires an explicit confirmation tap. Sessions otherwise persist
 * indefinitely (no auto sign-out) so the only way an older-adult user gets logged
 * out unexpectedly is an accidental tap on this button — the confirmation step
 * exists specifically to prevent that.
 */
export function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="gap-2 text-base"
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-5" />
        ออกจากระบบ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">ต้องการออกจากระบบใช่ไหม?</DialogTitle>
            <DialogDescription>ครั้งหน้าต้องพิมพ์อีเมลและรหัสผ่านใหม่อีกครั้ง</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <form action={signOutAction} className="w-full">
              <Button type="submit" variant="destructive" size="lg" className="w-full text-lg">
                ออกจากระบบ
              </Button>
            </form>
            <Button type="button" variant="outline" size="lg" className="w-full text-lg" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
