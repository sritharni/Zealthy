import { apiRoutes } from "@/config/routes";
import { apiClient } from "@/lib/http/api-client";

import type {
  AppointmentListQuery,
  AppointmentPatchInput,
  AppointmentUpsertInput,
} from "../schema";
import type { AppointmentRecord } from "../types";

export const appointmentApi = {
  async list(query: AppointmentListQuery): Promise<AppointmentRecord[]> {
    const { data } = await apiClient.get<AppointmentRecord[]>(apiRoutes.appointments.collection, {
      params: query,
    });
    return data;
  },
  async create(input: AppointmentUpsertInput): Promise<AppointmentRecord> {
    const { data } = await apiClient.post<AppointmentRecord>(apiRoutes.appointments.collection, input);
    return data;
  },
  async update(id: string, input: AppointmentPatchInput): Promise<AppointmentRecord> {
    const { data } = await apiClient.patch<AppointmentRecord>(apiRoutes.appointments.item(id), input);
    return data;
  },
  async remove(id: string): Promise<{ id: string }> {
    const { data } = await apiClient.delete<{ id: string }>(apiRoutes.appointments.item(id));
    return data;
  },
};
