import { apiClient } from "@/lib/http/api-client";
import type { Paginated } from "@/lib/http/api-response";
import { apiRoutes } from "@/config/routes";

import type {
  PatientListQuery,
  PatientCreateInput,
  PatientUpdateInput,
} from "../schema";
import type { PatientDetail, PatientListItem, PatientPortalSummary } from "../types";

/**
 * Thin transport-layer wrapper. No business logic here — just maps a
 * function call to an HTTP request and asserts the response shape via the
 * shared apiClient envelope.
 */
export const patientApi = {
  async list(query: PatientListQuery): Promise<Paginated<PatientListItem>> {
    const { data } = await apiClient.get<Paginated<PatientListItem>>(
      apiRoutes.patients.collection,
      { params: serialize(query) },
    );
    return data;
  },

  async getById(id: string): Promise<PatientDetail> {
    const { data } = await apiClient.get<PatientDetail>(apiRoutes.patients.item(id));
    return data;
  },

  async getPortalSummary(id: string): Promise<PatientPortalSummary> {
    const { data } = await apiClient.get<PatientPortalSummary>(
      apiRoutes.patients.portalSummary(id),
    );
    return data;
  },

  async create(input: PatientCreateInput): Promise<PatientDetail> {
    const { data } = await apiClient.post<PatientDetail>(apiRoutes.patients.collection, input);
    return data;
  },

  async update(id: string, input: PatientUpdateInput): Promise<PatientDetail> {
    const { data } = await apiClient.patch<PatientDetail>(apiRoutes.patients.item(id), input);
    return data;
  },
};

function serialize(query: PatientListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
    dir: query.dir,
  };
  if (query.q) params.q = query.q;
  return params;
}
