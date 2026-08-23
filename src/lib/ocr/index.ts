import "server-only";

import { ManualEntryOcrProvider } from "./manual-entry-provider";
import { ClaudeOcrProvider } from "./claude-ocr-provider";
import type { OcrProvider } from "./types";

export type { OcrProvider, ThaiIdCardOcrResult } from "./types";

/**
 * Returns the configured OCR provider. Defaults to Claude's vision API
 * (ClaudeOcrProvider) when ANTHROPIC_API_KEY is set; otherwise falls back to the
 * manual-entry stub so the registration flow still works with zero config. The
 * rest of the app (features/patients) only depends on the OcrProvider interface,
 * never on a specific vendor — swap in a different provider by implementing
 * OcrProvider and returning it here.
 *
 * The raw ID card image is only ever sent to the OCR provider from server code
 * (a server action), never uploaded to a third party directly from the browser.
 */
export function getOcrProvider(): OcrProvider {
  const provider = process.env.OCR_PROVIDER ?? (process.env.ANTHROPIC_API_KEY ? "claude" : "manual");

  switch (provider) {
    case "claude":
      return new ClaudeOcrProvider();
    default:
      return new ManualEntryOcrProvider();
  }
}
