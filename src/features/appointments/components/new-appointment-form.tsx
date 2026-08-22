"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PatientPicker } from "@/features/patients/components/patient-picker";
import { createAppointment } from "@/features/appointments/actions/appointment-actions";
import type { Patient } from "@/lib/supabase/types";

export function NewAppointmentForm() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!patient || !dateTime) return;

    startTransition(async () => {
      try {
        await createAppointment({
          patientId: patient.id,
          appointmentAt: new Date(dateTime).toISOString(),
          reason,
        });
        toast.success("บันทึกนัดหมายสำเร็จ");
        router.push("/appointments");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "บันทึกนัดหมายไม่สำเร็จ");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h2 className="text-2xl font-bold">นัดหมายใหม่</h2>

      <div className="flex flex-col gap-2">
        <Label className="text-lg">คนไข้</Label>
        <PatientPicker selected={patient} onSelect={setPatient} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="appointment-datetime" className="text-lg">
          วันและเวลานัด
        </Label>
        <Input
          id="appointment-datetime"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="h-14 text-lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-lg">เหตุผลการนัด</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="text-lg" />
      </div>

      <Button
        size="lg"
        className="h-14 text-lg"
        disabled={!patient || !dateTime || isPending}
        onClick={handleSubmit}
      >
        บันทึกนัดหมาย
      </Button>
    </div>
  );
}
