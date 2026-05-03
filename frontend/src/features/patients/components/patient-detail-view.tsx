"use client";

import { ErrorState } from "@/components/feedback/error-state";

import { usePatient } from "../hooks/use-patient";
import { PatientDetailHeader } from "./patient-detail-header";
import { PatientDetailSkeleton } from "./patient-detail-skeleton";
import { PatientDetailTabs } from "./patient-detail-tabs";

type Props = { patientId: string };

export function PatientDetailView({ patientId }: Props) {
  const query = usePatient(patientId);

  if (query.isPending) return <PatientDetailSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const patient = query.data;
  return (
    <div className="space-y-6">
      <PatientDetailHeader patient={patient} />
      <PatientDetailTabs patient={patient} />
    </div>
  );
}