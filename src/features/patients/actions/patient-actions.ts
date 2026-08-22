"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/audit";
import { getOcrProvider, type ThaiIdCardOcrResult } from "@/lib/ocr";
import type { Patient } from "@/lib/supabase/types";
import type { DuplicateMatch, DuplicateMatchReason, PatientFormInput } from "@/features/patients/types";

const DUPLICATE_CHECK_COLUMNS = "id, hn, first_name, last_name, phone, citizen_id, birth_date" as const;

/**
 * Checks for possible duplicate patients before a new one is created, per
 * docs/PRODUCT_SPEC.md: citizen ID, then phone, then name + birth date.
 */
export async function checkForDuplicatePatients(input: {
  citizenId: string;
  phone: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
}): Promise<DuplicateMatch[]> {
  await requireActiveStaff();
  const supabase = await createClient();

  const matches = new Map<string, DuplicateMatch>();

  function addMatch(row: Record<string, unknown>, reason: DuplicateMatchReason) {
    const id = row.id as string;
    const existing = matches.get(id);
    if (existing) {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      return;
    }
    matches.set(id, {
      patient: {
        id,
        hn: row.hn as string,
        first_name: row.first_name as string,
        last_name: row.last_name as string,
        phone: row.phone as string,
      },
      reasons: [reason],
    });
  }

  if (input.citizenId.trim()) {
    const { data } = await supabase
      .from("patients")
      .select(DUPLICATE_CHECK_COLUMNS)
      .eq("is_deleted", false)
      .eq("citizen_id", input.citizenId.trim())
      .limit(5);
    data?.forEach((row) => addMatch(row, "citizen_id"));
  }

  if (input.phone.trim()) {
    const { data } = await supabase
      .from("patients")
      .select(DUPLICATE_CHECK_COLUMNS)
      .eq("is_deleted", false)
      .eq("phone", input.phone.trim())
      .limit(5);
    data?.forEach((row) => addMatch(row, "phone"));
  }

  if (input.firstName.trim() && input.lastName.trim() && input.birthDate) {
    const { data } = await supabase
      .from("patients")
      .select(DUPLICATE_CHECK_COLUMNS)
      .eq("is_deleted", false)
      .ilike("first_name", input.firstName.trim())
      .ilike("last_name", input.lastName.trim())
      .eq("birth_date", input.birthDate)
      .limit(5);
    data?.forEach((row) => addMatch(row, "name_and_birthdate"));
  }

  return Array.from(matches.values());
}

export interface CreatePatientResult {
  status: "created" | "duplicates_found";
  patient?: Pick<Patient, "id" | "hn">;
  duplicates?: DuplicateMatch[];
}

/**
 * Creates a patient. By default runs duplicate detection first and returns the
 * matches instead of creating anything ("พบคนไข้ที่อาจเป็นคนเดียวกัน" step) — pass
 * `confirmNewPatient: true` once staff has explicitly chosen "ยืนยันสร้างคนไข้ใหม่".
 */
export async function createPatient(
  input: PatientFormInput,
  options: { confirmNewPatient?: boolean } = {}
): Promise<CreatePatientResult> {
  const staff = await requireActiveStaff();

  if (!input.privacyAcknowledged) {
    throw new Error("ต้องรับทราบประกาศความเป็นส่วนตัวก่อนบันทึกข้อมูล");
  }

  if (!options.confirmNewPatient) {
    const duplicates = await checkForDuplicatePatients({
      citizenId: input.citizenId,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
    });

    if (duplicates.length > 0) {
      return { status: "duplicates_found", duplicates };
    }
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      citizen_id: input.citizenId.trim() || null,
      phone: input.phone.trim(),
      birth_date: input.birthDate,
      gender: input.gender,
      address: input.address.trim() || null,
      allergies: input.allergies.trim() || null,
      chronic_conditions: input.chronicConditions.trim() || null,
      face_photo_path: input.facePhotoPath || null,
      id_card_photo_path: input.idCardPhotoPath || null,
      privacy_ack_at: new Date().toISOString(),
      created_by: staff.id,
    })
    .select("id, hn")
    .single();

  if (error || !data) {
    console.error("Failed to create patient", error);
    throw new Error("ไม่สามารถบันทึกข้อมูลคนไข้ได้ กรุณาลองใหม่อีกครั้ง");
  }

  revalidatePath("/patients");

  return { status: "created", patient: data };
}

export async function searchPatients(query: string): Promise<Patient[]> {
  await requireActiveStaff();
  const supabase = await createClient();

  const trimmed = query.trim();
  let request = supabase
    .from("patients")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(30);

  if (trimmed) {
    const escaped = trimmed.replace(/[%_]/g, "\\$&");
    request = request.or(
      [
        `hn.ilike.%${escaped}%`,
        `first_name.ilike.%${escaped}%`,
        `last_name.ilike.%${escaped}%`,
        `phone.ilike.%${escaped}%`,
      ].join(",")
    );
  }

  const { data, error } = await request;
  if (error) {
    console.error("Failed to search patients", error);
    throw new Error("ไม่สามารถค้นหาข้อมูลคนไข้ได้");
  }

  return data ?? [];
}

export async function getPatientById(id: string): Promise<Patient | null> {
  await requireActiveStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    console.error("Failed to load patient", error);
    throw new Error("ไม่สามารถโหลดข้อมูลคนไข้ได้");
  }

  return data;
}

/** Signed URL for the patient's face photo. Short TTL; not audited (not sensitive ID data). */
export async function getFacePhotoUrl(path: string): Promise<string | null> {
  await requireActiveStaff();
  if (!path) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("patient-photos").createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}

/**
 * Signed URL for the patient's Thai ID card photo. Sensitive — every call is
 * audited before the URL is returned, per docs/SECURITY.md.
 */
export async function getIdCardPhotoUrl(patientId: string, path: string): Promise<string | null> {
  await requireActiveStaff();
  if (!path) return null;

  await recordAuditEvent({
    action: "id_card.view",
    entityType: "patient",
    entityId: patientId,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("patient-id-cards").createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}

/**
 * Runs OCR on a Thai ID card photo, server-side only — the raw image never leaves
 * the server to reach a third-party OCR provider from the browser.
 */
export async function extractIdCardOcr(image: Blob): Promise<ThaiIdCardOcrResult> {
  await requireActiveStaff();
  const provider = getOcrProvider();
  return provider.extractThaiIdCard(image);
}
