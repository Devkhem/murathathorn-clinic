import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { listRecentVisits } from "@/features/visits/actions/visit-actions";

function formatVisitDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function VisitsPage() {
  const visits = await listRecentVisits();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-2xl font-bold">บันทึกการรักษา</h2>

      {visits.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">ยังไม่มีบันทึกการรักษา</p>
      )}

      <ul className="flex flex-col gap-3">
        {visits.map((visit) => (
          <li key={visit.id}>
            <Link href={visit.patient ? `/patients/${visit.patient.id}` : "#"}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-1 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                      {visit.patient ? `${visit.patient.first_name} ${visit.patient.last_name}` : "ไม่ทราบคนไข้"}
                    </p>
                    <span className="text-sm text-muted-foreground">{formatVisitDate(visit.visit_date)}</span>
                  </div>
                  {visit.chief_complaint && <p className="text-muted-foreground">{visit.chief_complaint}</p>}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
