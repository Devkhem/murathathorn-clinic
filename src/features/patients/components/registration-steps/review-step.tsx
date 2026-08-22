"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Gender } from "@/lib/supabase/types";

const GENDER_LABELS: Record<Gender, string> = {
  male: "ชาย",
  female: "หญิง",
  other: "อื่น ๆ",
  unknown: "ไม่ระบุ",
};

export interface ReviewFields {
  firstName: string;
  lastName: string;
  citizenId: string;
  birthDate: string;
  gender: Gender;
  address: string;
}

interface ReviewStepProps {
  fields: ReviewFields;
  onChange: (fields: ReviewFields) => void;
  ocrConfidence: number;
  privacyAcknowledged: boolean;
  onPrivacyAcknowledgedChange: (value: boolean) => void;
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-base">{props.label}</Label>
      {props.children}
    </div>
  );
}

export function ReviewStep({
  fields,
  onChange,
  ocrConfidence,
  privacyAcknowledged,
  onPrivacyAcknowledgedChange,
}: ReviewStepProps) {
  function set<K extends keyof ReviewFields>(key: K, value: ReviewFields[K]) {
    onChange({ ...fields, [key]: value });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <h2 className="text-center text-2xl font-bold">ตรวจข้อมูลก่อนบันทึก</h2>

      {ocrConfidence === 0 && (
        <Alert>
          <AlertDescription>
            ระบบยังไม่ได้อ่านข้อมูลจากบัตรอัตโนมัติ กรุณากรอกข้อมูลด้วยตนเอง
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="ชื่อ">
          <Input
            className="h-12 text-lg"
            value={fields.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </Field>
        <Field label="นามสกุล">
          <Input
            className="h-12 text-lg"
            value={fields.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </Field>
      </div>

      <Field label="เลขบัตรประชาชน">
        <Input
          className="h-12 text-lg"
          inputMode="numeric"
          maxLength={13}
          value={fields.citizenId}
          onChange={(e) => set("citizenId", e.target.value.replace(/\D/g, ""))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="วันเกิด">
          <Input
            className="h-12 text-lg"
            type="date"
            value={fields.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </Field>
        <Field label="เพศ">
          <Select value={fields.gender} onValueChange={(value) => set("gender", value as Gender)}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="ที่อยู่">
        <Textarea
          className="min-h-24 text-lg"
          value={fields.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          checked={privacyAcknowledged}
          onChange={(e) => onPrivacyAcknowledgedChange(e.target.checked)}
          className="mt-1 size-5"
        />
        <span className="text-base">
          ข้าพเจ้ารับทราบและยินยอมให้คลินิกจัดเก็บข้อมูลส่วนบุคคลและรูปบัตรประชาชนของคนไข้
          เพื่อการรักษาพยาบาล ตามประกาศความเป็นส่วนตัวของคลินิก
        </span>
      </label>
    </div>
  );
}
