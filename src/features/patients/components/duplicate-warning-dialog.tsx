"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DuplicateMatch } from "@/features/patients/types";

const REASON_LABELS: Record<string, string> = {
  citizen_id: "เลขบัตรประชาชนตรงกัน",
  phone: "เบอร์โทรตรงกัน",
  name_and_birthdate: "ชื่อ-นามสกุล และวันเกิดตรงกัน",
};

interface DuplicateWarningDialogProps {
  open: boolean;
  duplicates: DuplicateMatch[];
  onConfirmCreateNew: () => void;
  onCancel: () => void;
}

export function DuplicateWarningDialog({
  open,
  duplicates,
  onConfirmCreateNew,
  onCancel,
}: DuplicateWarningDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">พบคนไข้ที่อาจเป็นคนเดียวกัน</DialogTitle>
          <DialogDescription>ตรวจสอบข้อมูลด้านล่างก่อนสร้างคนไข้ใหม่</DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {duplicates.map((match) => (
            <li key={match.patient.id} className="rounded-xl border p-4">
              <p className="text-lg font-semibold">
                {match.patient.first_name} {match.patient.last_name}
              </p>
              <p className="text-muted-foreground">
                HN {match.patient.hn} · {match.patient.phone || "ไม่มีเบอร์โทร"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {match.reasons.map((r) => REASON_LABELS[r] ?? r).join(", ")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => router.push(`/patients/${match.patient.id}`)}
              >
                เปิดข้อมูลคนไข้เดิม
              </Button>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" size="lg" className="w-full text-lg" onClick={onConfirmCreateNew}>
            ยืนยันสร้างคนไข้ใหม่
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
            ยกเลิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
