"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

import { patientApi } from "../api/patient-api";
import type { PatientCreateInput, PatientUpdateInput } from "../schema";

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientCreateInput) => patientApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientUpdateInput) => patientApi.update(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.patients.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
    },
  });
}
