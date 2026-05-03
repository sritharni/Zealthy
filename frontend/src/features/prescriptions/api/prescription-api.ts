import { apiRoutes } from "@/config/routes";
import { apiClient } from "@/lib/http/api-client";

import type {
  PrescriptionListQuery,
  PrescriptionPatchInput,
  PrescriptionUpsertInput,
} from "../schema";
import type { PrescriptionRecord } from "../types";

export const prescriptionApi = {
  async list(query: PrescriptionListQuery): Promise<PrescriptionRecord[]> {
    const { data } = await apiClient.get<PrescriptionRecord[]>(apiRoutes.prescriptions.collection, {
      params: query,
    });
    return data;
  },
  async create(input: PrescriptionUpsertInput): Promise<PrescriptionRecord> {
    const { data } = await apiClient.post<PrescriptionRecord>(apiRoutes.prescriptions.collection, input);
    return data;
  },
  async update(id: string, input: PrescriptionPatchInput): Promise<PrescriptionRecord> {
    const { data } = await apiClient.patch<PrescriptionRecord>(apiRoutes.prescriptions.item(id), input);
    return data;
  },
  async remove(id: string): Promise<{ id: string }> {
    const { data } = await apiClient.delete<{ id: string }>(apiRoutes.prescriptions.item(id));
    return data;
  },
  async listMedicationCatalog(): Promise<Array<{ id: string; medicationName: string; dosage: string }>> {
    const { data } = await apiClient.get<Array<{ id: string; medicationName: string; dosage: string }>>(
      apiRoutes.medicationCatalog.collection,
    );
    return data;
  },
};
