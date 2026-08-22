"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { searchPatients } from "@/features/patients/actions/patient-actions";
import type { Patient } from "@/lib/supabase/types";

interface PatientPickerProps {
  selected: Patient | null;
  onSelect: (patient: Patient) => void;
}

/** Reusable "find a patient" control — used anywhere else needs to pick a patient (e.g. new appointment). */
export function PatientPicker({ selected, onSelect }: PatientPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selected) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        setResults(await searchPatients(query));
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, selected]);

  if (selected) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-lg font-semibold">
              {selected.first_name} {selected.last_name}
            </p>
            <p className="text-muted-foreground">HN {selected.hn}</p>
          </div>
          <button
            type="button"
            className="text-primary underline"
            onClick={() => onSelect(null as unknown as Patient)}
          >
            เปลี่ยน
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาคนไข้ด้วยชื่อหรือ HN"
          className="h-14 pl-12 text-lg"
        />
      </div>
      {isPending && <p className="text-muted-foreground">กำลังค้นหา...</p>}
      <ul className="flex flex-col gap-2">
        {results.map((patient) => (
          <li key={patient.id}>
            <button type="button" className="w-full text-left" onClick={() => onSelect(patient)}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="py-3">
                  <p className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">HN {patient.hn}</p>
                </CardContent>
              </Card>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
