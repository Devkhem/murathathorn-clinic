"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneStepProps {
  phone: string;
  onChange: (phone: string) => void;
}

export function PhoneStep({ phone, onChange }: PhoneStepProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">เบอร์โทรศัพท์คนไข้</h2>
      <div className="flex w-full flex-col gap-2">
        <Label htmlFor="phone" className="text-lg">
          เบอร์โทร
        </Label>
        <Input
          id="phone"
          inputMode="tel"
          type="tel"
          placeholder="08X-XXX-XXXX"
          value={phone}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 text-center text-2xl tracking-wide"
          autoFocus
        />
      </div>
    </div>
  );
}
