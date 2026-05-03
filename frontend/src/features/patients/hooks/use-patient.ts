"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

import { patientApi } from "../api/patient-api";

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => patientApi.getById(id),
    enabled: Boolean(id),
  });
}