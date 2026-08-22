import type { Gender } from "@/lib/supabase/types";

/** Fields the app can auto-fill from a Thai national ID card photo. */
export interface ThaiIdCardOcrResult {
  firstName: string;
  lastName: string;
  citizenId: string;
  birthDate: string | null; // ISO yyyy-mm-dd
  gender: Gender;
  address: string | null;
  /** 0-1 confidence, so the UI can flag low-confidence fields for the staff to check. */
  confidence: number;
}

export interface OcrProvider {
  /** `image` is the raw file bytes of the ID card photo. */
  extractThaiIdCard(image: Blob): Promise<ThaiIdCardOcrResult>;
}
