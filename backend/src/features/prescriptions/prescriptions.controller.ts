import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";

import { PrescriptionListQuerySchema, PrescriptionPatchSchema, PrescriptionUpsertSchema } from "@/shared";

import { jsonCreated, jsonOk } from "@/common/http/response";

import { PrescriptionsApplicationService } from "./prescriptions.application-service";

@Controller("prescriptions")
export class PrescriptionsController {
  constructor(
    @Inject(PrescriptionsApplicationService)
    private readonly prescriptions: PrescriptionsApplicationService,
  ) {}

  @Get()
  async list(@Query() query: Record<string, string | string[] | undefined>) {
    return jsonOk(await this.prescriptions.list(PrescriptionListQuerySchema.parse(query)));
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return jsonOk(await this.prescriptions.getById(id));
  }

  @Post()
  async create(@Body() body: unknown) {
    return jsonCreated(await this.prescriptions.create(PrescriptionUpsertSchema.parse(body)));
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    return jsonOk(await this.prescriptions.update(id, PrescriptionPatchSchema.parse(body)));
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return jsonOk(await this.prescriptions.remove(id));
  }
}
