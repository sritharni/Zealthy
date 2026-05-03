import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/feedback/page-header";
import { routes } from "@/config/routes";
import { PatientForm } from "@/features/patients/components/patient-form";

import shared from "../_shared.module.css";

export const metadata: Metadata = {
  title: "New patient",
};

export default function NewPatientPage() {
  return (
    <div className={shared.stack}>
      <Link href={routes.admin.root} className={shared.backLink}>
        <ChevronLeft className={shared.backIcon} aria-hidden />
        Back to patients
      </Link>
      <PageHeader
        title="New patient"
        description="Capture demographics and contact details. You can add medical history later."
      />
      <PatientForm mode="create" />
    </div>
  );
}
