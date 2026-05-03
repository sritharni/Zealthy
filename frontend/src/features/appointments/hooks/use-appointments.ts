"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

import { appointmentApi } from "../api/appointment-api";
import type { AppointmentListQuery, AppointmentPatchInput, AppointmentUpsertInput } from "../schema";

export function useAppointments(query: AppointmentListQuery) {
  return useQuery({
    queryKey: queryKeys.appointments.list(query),
    queryFn: () => appointmentApi.list(query),
    enabled: Boolean(query.patientId),
  });
}

export function useCreateAppointment(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentUpsertInput) => appointmentApi.create(input),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

export function useUpdateAppointment(patientId: string, appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentPatchInput) => appointmentApi.update(appointmentId, input),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

export function useDeleteAppointment(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => appointmentApi.remove(appointmentId),
    onSuccess: () => invalidatePatientScope(queryClient, patientId),
  });
}

function invalidatePatientScope(
  queryClient: ReturnType<typeof useQueryClient>,
  patientId: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
}
