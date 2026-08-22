import { Separator } from "@/components/ui/separator";
import { calculateAge } from "@/lib/date/age";
import { AddVisitDialog } from "@/features/visits/components/add-visit-dialog";
import { VisitTimeline } from "@/features/visits/components/visit-timeline";
import type { Patient, Visit } from "@/lib/supabase/types";

interface PatientProfileProps {
  patient: Patient;
  visits: Visit[];
  facePhotoUrl: string | null;
}

export function PatientProfile({ patient, visits, facePhotoUrl }: PatientProfileProps) {
  const age = calculateAge(patient.birth_date);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="size-28 shrink-0 overflow-hidden rounded-2xl border bg-muted">
          {facePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL, not a static asset
            <img src={facePhotoUrl} alt={patient.first_name} className="h-full w-full object-cover" />
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">
            {patient.first_name} {patient.last_name}
          </h2>
          <p className="text-muted-foreground">
            HN {patient.hn}
            {age !== null && ` · อายุ ${age} ปี`}
          </p>
          <p className="text-muted-foreground">{patient.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <p className="mb-1 text-sm text-muted-foreground">แพ้ยา / แพ้อาหาร</p>
          <p className="text-lg">{patient.allergies || "ไม่มีข้อมูล"}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="mb-1 text-sm text-muted-foreground">โรคประจำตัว</p>
          <p className="text-lg">{patient.chronic_conditions || "ไม่มีข้อมูล"}</p>
        </div>
      </div>

      <AddVisitDialog patientId={patient.id} />

      <Separator />

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold">ประวัติการรักษา</h3>
        <VisitTimeline visits={visits} />
      </div>
    </div>
  );
}
