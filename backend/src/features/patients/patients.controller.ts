import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";

import { PatientCreateSchema, PatientListQuerySchema, PatientUpdateSchema } from "@/shared";

import { PortalSessionGuard } from "@/common/guards/portal-session.guard";
import { jsonCreated, jsonOk } from "@/common/http/response";

import { patientService } from "./server/patient-service";

@Controller("patients")
export class PatientsController {
  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await patientService.list(PatientListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await patientService.getById(id));
  }

  @Get(":id/portal-summary")
  @UseGuards(PortalSessionGuard)
  async getPortalSummary(@Param("id") id: string) {
    return jsonOk(await patientService.getPortalSummary(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await patientService.create(PatientCreateSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await patientService.update(id, PatientUpdateSchema.parse(body)));
  }
}
