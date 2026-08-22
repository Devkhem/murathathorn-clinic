import { Card, CardContent } from "@/components/ui/card";
import type { Visit } from "@/lib/supabase/types";

function formatVisitDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VisitTimeline({ visits }: { visits: Visit[] }) {
  if (visits.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">ยังไม่มีประวัติการรักษา</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {visits.map((visit) => (
        <li key={visit.id}>
          <Card>
            <CardContent className="flex flex-col gap-1 py-4">
              <p className="text-sm text-muted-foreground">{formatVisitDate(visit.visit_date)}</p>
              {visit.chief_complaint && <p className="text-lg font-medium">{visit.chief_complaint}</p>}
              {visit.diagnosis && <p>วินิจฉัย: {visit.diagnosis}</p>}
              {visit.treatment_notes && (
                <p className="text-muted-foreground">{visit.treatment_notes}</p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
