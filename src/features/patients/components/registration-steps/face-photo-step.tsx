"use client";

import { CameraCapture } from "@/features/patients/components/camera-capture";

interface FacePhotoStepProps {
  onCapture: (file: File) => void;
}

export function FacePhotoStep({ onCapture }: FacePhotoStepProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">ถ่ายรูปหน้าคนไข้</h2>
      <p className="text-center text-muted-foreground">ให้คนไข้หันหน้าเข้ากล้อง แล้วกดถ่ายรูป</p>
      <CameraCapture label="รูปหน้าคนไข้" facingMode="user" onCapture={onCapture} />
    </div>
  );
}
