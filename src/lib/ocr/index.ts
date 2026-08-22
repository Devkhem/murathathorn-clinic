import "server-only";

import { ManualEntryOcrProvider } from "./manual-entry-provider";
import type { OcrProvider } from "./types";

export type { OcrProvider, ThaiIdCardOcrResult } from "./types";

/**
 * Returns the configured OCR provider. Swap in a real Thai ID card OCR provider
 * (e.g. an API like Typhoon OCR, iApp, or a cloud vision provider) by implementing
 * OcrProvider and returning it here when OCR_PROVIDER is set — the rest of the app
 * (features/patients) only depends on the OcrProvider interface, never on a
 * specific vendor.
 *
 * The raw ID card image is only ever sent to the OCR provider from server code
 * (a server action), never uploaded to a third party directly from the browser.
 */
export function getOcrProvider(): OcrProvider {
  const provider = process.env.OCR_PROVIDER;

  switch (provider) {
    // case "typhoon":
    //   return new TyphoonOcrProvider(requireEnv("OCR_API_KEY"));
    default:
      return new ManualEntryOcrProvider();
  }
}
