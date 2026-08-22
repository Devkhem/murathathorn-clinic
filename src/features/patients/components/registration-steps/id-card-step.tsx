"use client";

import { CameraCapture } from "@/features/patients/components/camera-capture";

interface IdCardStepProps {
  onCapture: (file: File) => void;
  isProcessingOcr: boolean;
}

export function IdCardStep({ onCapture, isProcessingOcr }: IdCardStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">ถ่ายรูปบัตรประชาชน</h2>
      <p className="text-center text-muted-foreground">วางบัตรประชาชนให้อยู่ในกรอบ แล้วกดถ่ายรูป</p>
      <CameraCapture label="บัตรประชาชน" facingMode="environment" onCapture={onCapture} />
      {isProcessingOcr && (
        <p className="text-center text-muted-foreground">กำลังอ่านข้อมูลจากบัตร...</p>
      )}
    </div>
  );
}
