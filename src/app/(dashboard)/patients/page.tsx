import { PatientSearch } from "@/features/patients/components/patient-search";
import { searchPatients } from "@/features/patients/actions/patient-actions";

export default async function PatientsPage() {
  const initialResults = await searchPatients("");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">คนไข้</h2>
      <PatientSearch initialResults={initialResults} />
    </div>
  );
}
