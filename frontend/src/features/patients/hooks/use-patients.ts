"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

import { patientApi } from "../api/patient-api";
import type { PatientListQuery } from "../schema";

export function usePatients(query: PatientListQuery) {
  return useQuery({
    queryKey: queryKeys.patients.list(query),
    queryFn: () => patientApi.list(query),
    placeholderData: keepPreviousData,
  });
}