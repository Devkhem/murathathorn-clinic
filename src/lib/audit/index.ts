import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "patient.create"
  | "patient.update"
  | "patient.soft_delete"
  | "visit.create"
  | "visit.soft_delete"
  | "appointment.create"
  | "appointment.update"
  | "id_card.view"
  | "face_photo.view";

export type AuditEntityType = "patient" | "visit" | "appointment";

/**
 * Writes an audit_logs row for an action that isn't already covered by a database
 * trigger — most importantly, sensitive *reads* like viewing a patient's ID card
 * photo (see docs/SECURITY.md). Writes covered by triggers
 * (supabase/migrations/20240101000006_audit_logs.sql) don't need to call this.
 */
export async function recordAuditEvent(params: {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    metadata: params.metadata ?? {},
  });

  if (error) {
    // Fail loudly in server logs — a silently-dropped audit event for sensitive
    // data access is a security gap, not just a UX bug.
    console.error("Failed to record audit event", params, error);
    throw new Error("ไม่สามารถบันทึกประวัติการเข้าถึงข้อมูลได้");
  }
}
