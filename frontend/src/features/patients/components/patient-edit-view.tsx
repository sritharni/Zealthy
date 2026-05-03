"use client";

import { ErrorState } from "@/components/feedback/error-state";

import { usePatient } from "../hooks/use-patient";
import { PatientDetailSkeleton } from "./patient-detail-skeleton";
import { PatientForm } from "./patient-form";

type Props = { patientId: string };

export function PatientEditView({ patientId }: Props) {
  const query = usePatient(patientId);

  if (query.isPending) return <PatientDetailSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return <PatientForm mode="edit" initial={query.data} />;
}