import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/feedback/page-header";
import { routes } from "@/config/routes";
import { PatientEditView } from "@/features/patients/components/patient-edit-view";

import shared from "../../_shared.module.css";

export const metadata: Metadata = {
  title: "Edit patient",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPatientPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className={shared.stack}>
      <Link href={routes.admin.patients.detail(id)} className={shared.backLink}>
        <ChevronLeft className={shared.backIcon} aria-hidden />
        Back to patient
      </Link>
      <PageHeader title="Edit patient" description="Update demographics and contact information." />
      <PatientEditView patientId={id} />
    </div>
  );
}
