"use client";

import { createClient } from "./client";

/**
 * Uploads a file to a private storage bucket from the browser. Allowed by the
 * bucket's RLS insert policy (active staff only — see
 * supabase/migrations/20240101000005_storage.sql). Returns the storage path to save
 * on the patient row; the object itself is only ever readable via a signed URL.
 */
export async function uploadPatientFile(params: {
  bucket: "patient-photos" | "patient-id-cards";
  folder: string;
  file: File;
}): Promise<string> {
  const supabase = createClient();
  const extension = params.file.name.split(".").pop() || "jpg";
  const path = `${params.folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(params.bucket).upload(path, params.file, {
    contentType: params.file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
  }

  return path;
}
