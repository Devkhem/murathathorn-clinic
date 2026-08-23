"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchPatients } from "@/features/patients/actions/patient-actions";
import { calculateAge } from "@/lib/date/age";
import type { Patient } from "@/lib/supabase/types";

interface PatientSearchProps {
  initialResults: Patient[];
}

export function PatientSearch({ initialResults }: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>(initialResults);
  const [isPending, startTransition] = useTransition();
  // The server already fetched the empty-query result set (initialResults) as
  // part of the page render. Track the query that `results` currently reflects
  // so the effect can skip re-fetching that same query the moment this
  // component mounts — a plain "first render" boolean doesn't survive React
  // StrictMode's dev-only double effect invocation (the ref flips to false on
  // the first invocation and stays false for the immediate second one, so the
  // guard silently stops guarding); comparing against the actual query value
  // does, since the value genuinely hasn't changed between those two calls.
  const lastFetchedQuery = useRef(query);

  useEffect(() => {
    if (query === lastFetchedQuery.current) return;

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await searchPatients(query);
        setResults(data);
        lastFetchedQuery.current = query;
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ, HN, หรือเบอร์โทร"
            className="h-14 pl-12 text-lg"
          />
        </div>
        <Button render={<Link href="/patients/new" />} nativeButton={false} size="lg" className="h-14 gap-2 text-lg">
          <UserPlus className="size-5" />
          <span className="hidden sm:inline">เพิ่มคนไข้</span>
        </Button>
      </div>

      {isPending && <p className="text-center text-muted-foreground">กำลังค้นหา...</p>}

      {!isPending && results.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลคนไข้</p>
      )}

      <ul className="flex flex-col gap-3">
        {results.map((patient) => (
          <li key={patient.id}>
            <Link href={`/patients/${patient.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-muted-foreground">
                      HN {patient.hn}
                      {patient.birth_date && ` · อายุ ${calculateAge(patient.birth_date)} ปี`}
                    </p>
                  </div>
                  <span className="text-muted-foreground">{patient.phone}</span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
