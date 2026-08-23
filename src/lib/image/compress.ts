"use client";

/**
 * Resizes + re-encodes an image file client-side before it ever leaves the
 * device. Camera photos from a phone/iPad can easily be 5-10MB — far past
 * Next.js's server-action body limit (see next.config.ts) and unnecessarily
 * expensive to upload/store/send to the OCR provider. A few-hundred-KB JPEG is
 * plenty for both storage and OCR accuracy.
 *
 * Falls back to the original file if compression fails for any reason (e.g. an
 * unsupported format) — better to send an oversized file than to block the
 * registration flow entirely.
 */
export async function compressImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 1600, quality = 0.82 } = options;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const compressedName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch (error) {
    console.error("Image compression failed, using original file", error);
    return file;
  }
}
