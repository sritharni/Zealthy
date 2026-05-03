import { Injectable } from "@nestjs/common";

import type {
  PatientCreateOutput,
  PatientDetail,
  PatientListQuery,
  PatientPortalSummary,
  PatientUpdateOutput,
} from "@/shared";
import type { Paginated, PatientListItem } from "@/shared";

import { patientService } from "./server/patient-service";

@Injectable()
export class PatientsApplicationService {
  list(query: PatientListQuery): Promise<Paginated<PatientListItem>> {
    return patientService.list(query);
  }

  getById(id: string): Promise<PatientDetail> {
    return patientService.getById(id);
  }

  getPortalSummary(id: string): Promise<PatientPortalSummary> {
    return patientService.getPortalSummary(id);
  }

  create(input: PatientCreateOutput): Promise<PatientDetail> {
    return patientService.create(input);
  }

  update(id: string, input: PatientUpdateOutput): Promise<PatientDetail> {
    return patientService.update(id, input);
  }
}
