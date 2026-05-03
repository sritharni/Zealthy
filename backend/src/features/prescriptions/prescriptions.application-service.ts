import { Injectable } from "@nestjs/common";

import type {
  PrescriptionListQuery,
  PrescriptionPatchOutput,
  PrescriptionRecord,
  PrescriptionUpsertOutput,
} from "@/shared";

import { prescriptionService } from "./server/prescription-service";

@Injectable()
export class PrescriptionsApplicationService {
  list(query: PrescriptionListQuery): Promise<PrescriptionRecord[]> {
    return prescriptionService.list(query);
  }

  getById(id: string): Promise<PrescriptionRecord> {
    return prescriptionService.getById(id);
  }

  create(input: PrescriptionUpsertOutput): Promise<PrescriptionRecord> {
    return prescriptionService.create(input);
  }

  update(id: string, input: PrescriptionPatchOutput): Promise<PrescriptionRecord> {
    return prescriptionService.update(id, input);
  }

  remove(id: string): Promise<{ id: string }> {
    return prescriptionService.remove(id);
  }
}
