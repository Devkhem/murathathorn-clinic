"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/permissions";
import type { Appointment, AppointmentStatus } from "@/lib/supabase/types";

export interface AppointmentWithPatient extends Appointment {
  patient: { id: string; hn: string; first_name: string; last_name: string } | null;
}

export async function listAppointments(params: { upcomingOnly?: boolean } = {}): Promise<
  AppointmentWithPatient[]
> {
  await requireActiveStaff();
  const supabase = await createClient();

  let request = supabase
    .from("appointments")
    .select("*, patient:patients(id, hn, first_name, last_name)")
    .order("appointment_at", { ascending: true });

  if (params.upcomingOnly) {
    request = request.eq("status", "scheduled").gte("appointment_at", new Date().toISOString());
  }

  const { data, error } = await request;

  if (error) {
    console.error("Failed to load appointments", error);
    throw new Error("ไม่สามารถโหลดข้อมูลนัดหมายได้");
  }

  return (data as unknown as AppointmentWithPatient[]) ?? [];
}

export async function createAppointment(input: {
  patientId: string;
  appointmentAt: string;
  reason: string;
}): Promise<Appointment> {
  const staff = await requireActiveStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: input.patientId,
      appointment_at: input.appointmentAt,
      reason: input.reason.trim() || null,
      created_by: staff.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create appointment", error);
    throw new Error("ไม่สามารถบันทึกนัดหมายได้");
  }

  revalidatePath("/appointments");
  return data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  await requireActiveStaff();
  const supabase = await createClient();

  const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId);

  if (error) {
    console.error("Failed to update appointment", error);
    throw new Error("ไม่สามารถอัปเดตสถานะนัดหมายได้");
  }

  revalidatePath("/appointments");
}
