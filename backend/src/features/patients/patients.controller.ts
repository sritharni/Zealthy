import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";

import { PatientCreateSchema, PatientListQuerySchema, PatientUpdateSchema } from "@/shared";

import { jsonCreated, jsonOk } from "@/common/http/response";

import { PatientsApplicationService } from "./patients.application-service";

@Controller("patients")
export class PatientsController {
  constructor(@Inject(PatientsApplicationService) private readonly patients: PatientsApplicationService) {}

  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await this.patients.list(PatientListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await this.patients.getById(id));
  }

  @Get(":id/portal-summary")
  async getPortalSummary(@Param("id") id: string) {
    return jsonOk(await this.patients.getPortalSummary(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await this.patients.create(PatientCreateSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await this.patients.update(id, PatientUpdateSchema.parse(body)));
  }
}
