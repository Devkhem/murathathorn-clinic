import type { OcrProvider, ThaiIdCardOcrResult } from "./types";

/**
 * Fallback provider used when no real OCR provider is configured (no OCR_PROVIDER /
 * OCR_API_KEY env var). Returns empty fields with zero confidence so the
 * "ตรวจข้อมูล" (review) step always renders an editable form — the registration flow
 * still works end-to-end, staff just type the fields OCR would normally fill in.
 */
export class ManualEntryOcrProvider implements OcrProvider {
  async extractThaiIdCard(): Promise<ThaiIdCardOcrResult> {
    return {
      firstName: "",
      lastName: "",
      citizenId: "",
      birthDate: null,
      gender: "unknown",
      address: null,
      confidence: 0,
    };
  }
}
