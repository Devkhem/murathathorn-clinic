"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/permissions";
import type { Visit } from "@/lib/supabase/types";

export interface RecentVisit extends Visit {
  patient: { id: string; hn: string; first_name: string; last_name: string } | null;
}

/** Recent treatment records across all patients, for the "บันทึกการรักษา" nav tab. */
export async function listRecentVisits(limit = 30): Promise<RecentVisit[]> {
  await requireActiveStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .select("*, patient:patients(id, hn, first_name, last_name)")
    .eq("is_deleted", false)
    .order("visit_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load recent visits", error);
    throw new Error("ไม่สามารถโหลดบันทึกการรักษาได้");
  }

  return (data as unknown as RecentVisit[]) ?? [];
}

export async function listVisitsForPatient(patientId: string): Promise<Visit[]> {
  await requireActiveStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", patientId)
    .eq("is_deleted", false)
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Failed to load visits", error);
    throw new Error("ไม่สามารถโหลดประวัติการรักษาได้");
  }

  return data ?? [];
}

/**
 * Creates a new treatment record. Never updates an existing visit — every call is a
 * brand new row, per docs/PRODUCT_SPEC.md.
 */
export async function createVisit(input: {
  patientId: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentNotes: string;
}): Promise<Visit> {
  const staff = await requireActiveStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .insert({
      patient_id: input.patientId,
      chief_complaint: input.chiefComplaint.trim() || null,
      diagnosis: input.diagnosis.trim() || null,
      treatment_notes: input.treatmentNotes.trim() || null,
      created_by: staff.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create visit", error);
    throw new Error("ไม่สามารถบันทึกการรักษาได้");
  }

  revalidatePath(`/patients/${input.patientId}`);
  revalidatePath("/visits");

  return data;
}
