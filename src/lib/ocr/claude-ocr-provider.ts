import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import type { Gender } from "@/lib/supabase/types";
import type { OcrProvider, ThaiIdCardOcrResult } from "./types";

const ThaiIdCardSchema = z.object({
  firstName: z.string().describe("Thai first name (ชื่อ), as printed on the card. Empty string if unreadable."),
  lastName: z.string().describe("Thai last name (นามสกุล), as printed on the card. Empty string if unreadable."),
  citizenId: z
    .string()
    .describe("The 13-digit Thai citizen ID number (เลขประจำตัวประชาชน), digits only, no dashes. Empty string if unreadable."),
  birthDate: z
    .string()
    .describe(
      "Date of birth converted to ISO yyyy-mm-dd in the Gregorian calendar. The card prints the Buddhist Era (พ.ศ.) year — subtract 543 to get the Gregorian year. Empty string if unreadable."
    ),
  gender: z.enum(["male", "female", "other", "unknown"]).describe("From เพศ: ชาย -> male, หญิง -> female."),
  address: z.string().describe("Address (ที่อยู่) exactly as printed, in Thai. Empty string if unreadable."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Your own confidence (0-1) that the extracted fields are accurate and complete."),
});

const SYSTEM_PROMPT = `You are reading a photo of a Thai national ID card (บัตรประจำตัวประชาชน) for a clinic's
patient-registration form. Extract exactly the fields in the schema, in Thai where the source text is Thai.
If the photo is blurry, cropped, or a field is not visible, leave that field as an empty string rather than
guessing — and reflect that in a lower confidence score. Never invent a citizen ID or birth date.`;

/**
 * OCR provider backed by Claude's vision + structured outputs. Reads the raw
 * image bytes server-side only — see docs/SECURITY.md (the photo never reaches
 * a third party from the browser; this call happens inside the server action in
 * features/patients/actions/patient-actions.ts).
 */
export class ClaudeOcrProvider implements OcrProvider {
  private client: Anthropic;

  constructor() {
    // Anthropic() with no args reads ANTHROPIC_API_KEY from the environment.
    this.client = new Anthropic();
  }

  async extractThaiIdCard(image: Blob): Promise<ThaiIdCardOcrResult> {
    const buffer = Buffer.from(await image.arrayBuffer());
    const mediaType = normalizeMediaType(image.type);

    const response = await this.client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") },
            },
            { type: "text", text: "Extract the fields from this Thai national ID card." },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ThaiIdCardSchema) },
    });

    if (!response.parsed_output) {
      // Parsing failed (e.g. the model refused or returned malformed output) —
      // fall back to "nothing extracted" rather than throwing, so the
      // registration flow degrades to manual entry instead of breaking.
      return { firstName: "", lastName: "", citizenId: "", birthDate: null, gender: "unknown", address: null, confidence: 0 };
    }

    const parsed = response.parsed_output;

    return {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      citizenId: parsed.citizenId,
      birthDate: parsed.birthDate || null,
      gender: parsed.gender as Gender,
      address: parsed.address || null,
      confidence: parsed.confidence,
    };
  }
}

function normalizeMediaType(mimeType: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  switch (mimeType) {
    case "image/png":
    case "image/gif":
    case "image/webp":
      return mimeType;
    default:
      return "image/jpeg";
  }
}
