"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

import { prescriptionApi } from "../api/prescription-api";
import type {
  PrescriptionListQuery,
  PrescriptionPatchInput,
  PrescriptionUpsertInput,
} from "../schema";

export function usePrescriptions(query: PrescriptionListQuery) {
  return useQuery({
    queryKey: queryKeys.prescriptions.list(query),
    queryFn: () => prescriptionApi.list(query),
    enabled: Boolean(query.patientId),
  });
}

export function useMedicationCatalog() {
  return useQuery({
    queryKey: queryKeys.medicationCatalog.all,
    queryFn: () => prescriptionApi.listMedicationCatalog(),
  });
}

export function useCreatePrescription(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrescriptionUpsertInput) => prescriptionApi.create(input),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

export function useUpdatePrescription(patientId: string, prescriptionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrescriptionPatchInput) => prescriptionApi.update(prescriptionId, input),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

export function useDeletePrescription(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId: string) => prescriptionApi.remove(prescriptionId),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

function invalidatePatientScope(
  queryClient: ReturnType<typeof useQueryClient>,
  patientId: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
}
