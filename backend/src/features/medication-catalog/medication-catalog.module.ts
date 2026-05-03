import { Module } from "@nestjs/common";

import { MedicationCatalogApplicationService } from "./medication-catalog.application-service";
import { MedicationCatalogController } from "./medication-catalog.controller";

@Module({
  controllers: [MedicationCatalogController],
  providers: [MedicationCatalogApplicationService],
})
export class MedicationCatalogModule {}
