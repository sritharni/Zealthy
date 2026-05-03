import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { PatientDetailView } from "@/features/patients/components/patient-detail-view";

import shared from "../_shared.module.css";

export const metadata: Metadata = {
  title: "Patient",
};

type Props = { params: Promise<{ id: string }> };

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className={shared.stack}>
      <Link href={routes.admin.root} className={shared.backLink}>
        <ChevronLeft className={shared.backIcon} aria-hidden />
        Back to patients
      </Link>
      <PatientDetailView patientId={id} />
    </div>
  );
}
