"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createVisit } from "@/features/visits/actions/visit-actions";

interface AddVisitDialogProps {
  patientId: string;
}

export function AddVisitDialog({ patientId }: AddVisitDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setChiefComplaint("");
    setDiagnosis("");
    setTreatmentNotes("");
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await createVisit({ patientId, chiefComplaint, diagnosis, treatmentNotes });
        toast.success("บันทึกการรักษาสำเร็จ");
        reset();
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="h-14 w-full gap-2 text-lg" />}>
        <Plus className="size-5" />
        บันทึกการรักษาวันนี้
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">บันทึกการรักษาวันนี้</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-base">อาการ</Label>
            <Textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} className="text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-base">การวินิจฉัย</Label>
            <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-base">การรักษา / บันทึกเพิ่มเติม</Label>
            <Textarea
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>

        <DialogFooter>
          <Button size="lg" className="w-full text-lg" disabled={isPending} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
