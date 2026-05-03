import { Controller, Get } from "@nestjs/common";

import { jsonOk } from "@/common/http/response";

import { medicationCatalogService } from "./server/medication-catalog-service";

@Controller("medication-catalog")
export class MedicationCatalogController {
  @Get()
  async list() {
    return jsonOk(await medicationCatalogService.list());
  }
}
