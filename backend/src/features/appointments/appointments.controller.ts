import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";

import { AppointmentListQuerySchema, AppointmentPatchSchema, AppointmentUpsertSchema } from "@/shared";

import { jsonCreated, jsonOk } from "@/common/http/response";

import { AppointmentsApplicationService } from "./appointments.application-service";

@Controller("appointments")
export class AppointmentsController {
  constructor(
    @Inject(AppointmentsApplicationService)
    private readonly appointments: AppointmentsApplicationService,
  ) {}

  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await this.appointments.list(AppointmentListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await this.appointments.getById(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await this.appointments.create(AppointmentUpsertSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await this.appointments.update(id, AppointmentPatchSchema.parse(body)));
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return jsonOk(await this.appointments.remove(id));
  }
}
