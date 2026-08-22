import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AppointmentWithPatient } from "@/features/appointments/actions/appointment-actions";
import type { AppointmentStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "นัดหมายแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  no_show: "ไม่มาตามนัด",
};

function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentList({ appointments }: { appointments: AppointmentWithPatient[] }) {
  if (appointments.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">ยังไม่มีนัดหมาย</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <Link href={appointment.patient ? `/patients/${appointment.patient.id}` : "#"}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-lg font-semibold">
                    {appointment.patient
                      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                      : "ไม่ทราบคนไข้"}
                  </p>
                  <p className="text-muted-foreground">{formatAppointmentDate(appointment.appointment_at)}</p>
                  {appointment.reason && <p className="text-sm text-muted-foreground">{appointment.reason}</p>}
                </div>
                <Badge variant={appointment.status === "scheduled" ? "default" : "secondary"}>
                  {STATUS_LABELS[appointment.status]}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
