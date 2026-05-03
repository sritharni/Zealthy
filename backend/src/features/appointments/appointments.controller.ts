import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { AppointmentListQuerySchema, AppointmentPatchSchema, AppointmentUpsertSchema } from "@/shared";

import { jsonCreated, jsonOk } from "@/common/http/response";

import { appointmentService } from "./server/appointment-service";

@Controller("appointments")
export class AppointmentsController {
  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await appointmentService.list(AppointmentListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await appointmentService.getById(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await appointmentService.create(AppointmentUpsertSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await appointmentService.update(id, AppointmentPatchSchema.parse(body)));
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return jsonOk(await appointmentService.remove(id));
  }
}
