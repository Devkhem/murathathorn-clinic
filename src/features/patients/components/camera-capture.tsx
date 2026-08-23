"use client";

import { useRef, useState } from "react";
import { Camera, RotateCcw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image/compress";

interface CameraCaptureProps {
  label: string;
  /** "user" = front camera (for a face photo), "environment" = back camera (for an ID card). */
  facingMode: "user" | "environment";
  onCapture: (file: File) => void;
  className?: string;
}

/**
 * Big, single-purpose "take a photo" control. Uses a native file input with the
 * `capture` attribute so it opens the device camera directly on iPad/mobile Safari
 * and Chrome, with an obvious retake action — no custom camera UI to maintain.
 *
 * The captured photo is compressed client-side (see lib/image/compress.ts) before
 * `onCapture` fires — a full-resolution camera photo is well past what the
 * server actions that consume it (storage upload, OCR) can handle comfortably.
 */
export function CameraCapture({ label, facingMode, onCapture, className }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file);
      onCapture(compressed);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={facingMode}
        className="hidden"
        onChange={handleChange}
      />

      {previewUrl ? (
        <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview, not a static asset */}
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-muted-foreground">
          <Camera className="size-12" />
          <span className="text-lg">{label}</span>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        variant={previewUrl ? "outline" : "default"}
        className="h-14 w-full max-w-sm gap-2 text-lg"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <RotateCcw className="size-5" />
            ถ่ายใหม่
          </>
        ) : (
          <>
            <Camera className="size-5" />
            ถ่ายรูป
          </>
        )}
      </Button>
    </div>
  );
}
