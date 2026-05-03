import { Module } from "@nestjs/common";

import { MedicationCatalogController } from "./medication-catalog.controller";

@Module({
  controllers: [MedicationCatalogController],
})
export class MedicationCatalogModule {}
