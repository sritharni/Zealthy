import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { PrescriptionListQuerySchema, PrescriptionPatchSchema, PrescriptionUpsertSchema } from "@/shared";

import { jsonCreated, jsonOk } from "@/common/http/response";

import { prescriptionService } from "./server/prescription-service";

@Controller("prescriptions")
export class PrescriptionsController {
  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await prescriptionService.list(PrescriptionListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await prescriptionService.getById(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await prescriptionService.create(PrescriptionUpsertSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await prescriptionService.update(id, PrescriptionPatchSchema.parse(body)));
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return jsonOk(await prescriptionService.remove(id));
  }
}
