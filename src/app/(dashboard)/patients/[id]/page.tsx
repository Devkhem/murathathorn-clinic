import { notFound } from "next/navigation";

import { getPatientById, getFacePhotoUrl } from "@/features/patients/actions/patient-actions";
import { listVisitsForPatient } from "@/features/visits/actions/visit-actions";
import { PatientProfile } from "@/features/patients/components/patient-profile";

export default async function PatientProfilePage({ params }: PageProps<"/patients/[id]">) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  const [visits, facePhotoUrl] = await Promise.all([
    listVisitsForPatient(patient.id),
    patient.face_photo_path ? getFacePhotoUrl(patient.face_photo_path) : Promise.resolve(null),
  ]);

  return <PatientProfile patient={patient} visits={visits} facePhotoUrl={facePhotoUrl} />;
}
