/**
 * Hand-written types mirroring supabase/migrations/*.sql until we generate real
 * types with `npx supabase gen types typescript` against a linked project.
 *
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 * and re-add the hand-written convenience aliases at the bottom. The shape below
 * (Tables/Views/Functions, each table with Row/Insert/Update/Relationships) matches
 * what the generator produces and what @supabase/postgrest-js's generics expect.
 */

export type StaffRole = "admin" | "staff";
export type Gender = "male" | "female" | "other" | "unknown";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          hn: string;
          first_name: string;
          last_name: string;
          citizen_id: string | null;
          phone: string;
          birth_date: string | null;
          gender: Gender;
          address: string | null;
          allergies: string | null;
          chronic_conditions: string | null;
          face_photo_path: string | null;
          id_card_photo_path: string | null;
          privacy_ack_at: string | null;
          is_deleted: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["patients"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["patients"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      visits: {
        Row: {
          id: string;
          patient_id: string;
          visit_date: string;
          chief_complaint: string | null;
          diagnosis: string | null;
          treatment_notes: string | null;
          is_deleted: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["visits"]["Row"]> & { patient_id: string };
        Update: Partial<Database["public"]["Tables"]["visits"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          appointment_at: string;
          reason: string | null;
          status: AppointmentStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> & {
          patient_id: string;
          appointment_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: "patient" | "visit" | "appointment";
          entity_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          action: string;
          entity_type: "patient" | "visit" | "appointment";
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
