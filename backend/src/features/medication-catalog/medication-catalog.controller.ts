import { Controller, Get, Inject } from "@nestjs/common";

import { jsonOk } from "@/common/http/response";

import { MedicationCatalogApplicationService } from "./medication-catalog.application-service";

@Controller("medication-catalog")
export class MedicationCatalogController {
  constructor(
    @Inject(MedicationCatalogApplicationService)
    private readonly medicationCatalog: MedicationCatalogApplicationService,
  ) {}

  @Get()
  async list() {
    return jsonOk(await this.medicationCatalog.list());
  }
}
