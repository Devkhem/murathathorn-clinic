import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listAppointments } from "@/features/appointments/actions/appointment-actions";
import { AppointmentList } from "@/features/appointments/components/appointment-list";

export default async function AppointmentsPage() {
  const appointments = await listAppointments();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">นัดหมาย</h2>
        <Button render={<Link href="/appointments/new" />} nativeButton={false} size="lg" className="h-12 gap-2">
          <CalendarPlus className="size-5" />
          นัดหมายใหม่
        </Button>
      </div>

      <AppointmentList appointments={appointments} />
    </div>
  );
}
