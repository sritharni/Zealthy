import { Injectable } from "@nestjs/common";

import { medicationCatalogService } from "./server/medication-catalog-service";

@Injectable()
export class MedicationCatalogApplicationService {
  list() {
    return medicationCatalogService.list();
  }
}
