import type { Gender, Patient } from "@/lib/supabase/types";

export interface PatientFormInput {
  firstName: string;
  lastName: string;
  citizenId: string;
  phone: string;
  birthDate: string | null; // ISO yyyy-mm-dd
  gender: Gender;
  address: string;
  allergies: string;
  chronicConditions: string;
  facePhotoPath: string;
  idCardPhotoPath: string;
  privacyAcknowledged: boolean;
}

export type DuplicateMatchReason = "citizen_id" | "phone" | "name_and_birthdate";

export interface DuplicateMatch {
  patient: Pick<Patient, "id" | "hn" | "first_name" | "last_name" | "phone">;
  reasons: DuplicateMatchReason[];
}
