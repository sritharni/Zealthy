import { Injectable } from "@nestjs/common";

import type {
  AppointmentListQuery,
  AppointmentPatchOutput,
  AppointmentRecord,
  AppointmentUpsertOutput,
} from "@/shared";

import { appointmentService } from "./server/appointment-service";

@Injectable()
export class AppointmentsApplicationService {
  list(query: AppointmentListQuery): Promise<AppointmentRecord[]> {
    return appointmentService.list(query);
  }

  getById(id: string): Promise<AppointmentRecord> {
    return appointmentService.getById(id);
  }

  create(input: AppointmentUpsertOutput): Promise<AppointmentRecord> {
    return appointmentService.create(input);
  }

  update(id: string, input: AppointmentPatchOutput): Promise<AppointmentRecord> {
    return appointmentService.update(id, input);
  }

  remove(id: string): Promise<{ id: string }> {
    return appointmentService.remove(id);
  }
}
