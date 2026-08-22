"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadPatientFile } from "@/lib/supabase/storage";
import { createPatient, extractIdCardOcr } from "@/features/patients/actions/patient-actions";
import type { DuplicateMatch, PatientFormInput } from "@/features/patients/types";
import type { Gender } from "@/lib/supabase/types";

import { FacePhotoStep } from "./registration-steps/face-photo-step";
import { IdCardStep } from "./registration-steps/id-card-step";
import { PhoneStep } from "./registration-steps/phone-step";
import { ReviewStep, type ReviewFields } from "./registration-steps/review-step";
import { DuplicateWarningDialog } from "./duplicate-warning-dialog";

type Step = "face" | "id_card" | "phone" | "review";

const STEP_ORDER: Step[] = ["face", "id_card", "phone", "review"];
const STEP_TITLES: Record<Step, string> = {
  face: "ถ่ายรูปหน้า",
  id_card: "ถ่ายบัตรประชาชน",
  phone: "เบอร์โทร",
  review: "ตรวจข้อมูล",
};

const EMPTY_REVIEW_FIELDS: ReviewFields = {
  firstName: "",
  lastName: "",
  citizenId: "",
  birthDate: "",
  gender: "unknown",
  address: "",
};

export function PatientRegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("face");
  const [isPending, startTransition] = useTransition();

  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(0);

  const [phone, setPhone] = useState("");
  const [reviewFields, setReviewFields] = useState<ReviewFields>(EMPTY_REVIEW_FIELDS);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [pendingUploads, setPendingUploads] = useState<{
    facePhotoPath: string;
    idCardPhotoPath: string;
  } | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoNext = useMemo(() => {
    if (step === "face") return !!faceFile;
    if (step === "id_card") return !!idCardFile && !isProcessingOcr;
    if (step === "phone") return phone.trim().length >= 9;
    if (step === "review") {
      return (
        reviewFields.firstName.trim() &&
        reviewFields.lastName.trim() &&
        privacyAcknowledged
      );
    }
    return false;
  }, [step, faceFile, idCardFile, isProcessingOcr, phone, reviewFields, privacyAcknowledged]);

  async function handleIdCardCapture(file: File) {
    setIdCardFile(file);
    setIsProcessingOcr(true);
    try {
      const result = await extractIdCardOcr(file);
      setOcrConfidence(result.confidence);
      setReviewFields({
        firstName: result.firstName,
        lastName: result.lastName,
        citizenId: result.citizenId,
        birthDate: result.birthDate ?? "",
        gender: result.gender,
        address: result.address ?? "",
      });
    } catch (error) {
      console.error("OCR failed", error);
      toast.error("อ่านข้อมูลจากบัตรไม่สำเร็จ กรุณากรอกข้อมูลด้วยตนเอง");
    } finally {
      setIsProcessingOcr(false);
    }
  }

  function goNext() {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setStep(STEP_ORDER[nextIndex]);
    } else {
      void handleSave();
    }
  }

  function goBack() {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEP_ORDER[prevIndex]);
    } else {
      router.back();
    }
  }

  async function buildPatientInput(): Promise<PatientFormInput> {
    let uploads = pendingUploads;

    if (!uploads) {
      if (!faceFile || !idCardFile) {
        throw new Error("กรุณาถ่ายรูปหน้าและบัตรประชาชนให้ครบ");
      }
      const folder = crypto.randomUUID();
      const [facePhotoPath, idCardPhotoPath] = await Promise.all([
        uploadPatientFile({ bucket: "patient-photos", folder, file: faceFile }),
        uploadPatientFile({ bucket: "patient-id-cards", folder, file: idCardFile }),
      ]);
      uploads = { facePhotoPath, idCardPhotoPath };
      setPendingUploads(uploads);
    }

    return {
      firstName: reviewFields.firstName,
      lastName: reviewFields.lastName,
      citizenId: reviewFields.citizenId,
      phone,
      birthDate: reviewFields.birthDate || null,
      gender: reviewFields.gender as Gender,
      address: reviewFields.address,
      allergies: "",
      chronicConditions: "",
      facePhotoPath: uploads.facePhotoPath,
      idCardPhotoPath: uploads.idCardPhotoPath,
      privacyAcknowledged,
    };
  }

  async function handleSave(confirmNewPatient = false) {
    startTransition(async () => {
      try {
        const input = await buildPatientInput();
        const result = await createPatient(input, { confirmNewPatient });

        if (result.status === "duplicates_found") {
          setDuplicates(result.duplicates ?? []);
          return;
        }

        setDuplicates(null);
        toast.success(`บันทึกคนไข้ใหม่สำเร็จ HN ${result.patient?.hn}`);
        router.push(`/patients/${result.patient?.id}`);
      } catch (error) {
        console.error("Failed to save patient", error);
        toast.error(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-center text-muted-foreground">
          ขั้นตอนที่ {stepIndex + 1} จาก {STEP_ORDER.length} · {STEP_TITLES[step]}
        </p>
        <div className="flex h-2 gap-1">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className={`flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {step === "face" && <FacePhotoStep onCapture={setFaceFile} />}
      {step === "id_card" && (
        <IdCardStep onCapture={handleIdCardCapture} isProcessingOcr={isProcessingOcr} />
      )}
      {step === "phone" && <PhoneStep phone={phone} onChange={setPhone} />}
      {step === "review" && (
        <ReviewStep
          fields={reviewFields}
          onChange={setReviewFields}
          ocrConfidence={ocrConfidence}
          privacyAcknowledged={privacyAcknowledged}
          onPrivacyAcknowledgedChange={setPrivacyAcknowledged}
        />
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="h-14 flex-1 gap-2 text-lg" onClick={goBack}>
          <ArrowLeft className="size-5" />
          ย้อนกลับ
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-14 flex-1 gap-2 text-lg"
          disabled={!canGoNext || isPending}
          onClick={goNext}
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : step === "review" ? (
            "บันทึก"
          ) : (
            <>
              ถัดไป
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </div>

      <DuplicateWarningDialog
        open={!!duplicates}
        duplicates={duplicates ?? []}
        onConfirmCreateNew={() => handleSave(true)}
        onCancel={() => setDuplicates(null)}
      />
    </div>
  );
}
