"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface SuccessStepProps {
  hn: string;
  onContinue: () => void;
}

/**
 * Shown for a moment after a patient is saved — a clear, unmissable confirmation
 * (per docs/PRODUCT_SPEC.md: "provide clear confirmations") with the new HN front
 * and center. The celebratory confetti/motion is deliberately confined to this one
 * screen, not sprinkled through the data-entry steps, so it reads as "done!" rather
 * than as noise while staff are working.
 */
export function SuccessStep({ hn, onContinue }: SuccessStepProps) {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-6 overflow-hidden py-10 text-center">
      <Confetti
        ref={confettiRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        options={{ particleCount: 120, spread: 90, origin: { y: 0.4 } }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 className="size-20 text-primary" strokeWidth={1.5} />
      </motion.div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">บันทึกคนไข้ใหม่สำเร็จ</h2>
        <p className="text-muted-foreground">หมายเลขประจำตัวคนไข้ (HN)</p>
        <AnimatedGradientText
          colorFrom="#3f7d4f"
          colorTo="#c99a3d"
          speed={1.5}
          className="text-4xl font-extrabold tracking-wide"
        >
          {hn}
        </AnimatedGradientText>
      </div>

      <Button size="lg" className="h-14 w-full max-w-xs text-lg" onClick={onContinue}>
        ไปหน้าคนไข้
      </Button>
    </div>
  );
}
