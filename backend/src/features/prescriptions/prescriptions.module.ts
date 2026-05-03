import { Module } from "@nestjs/common";

import { PrescriptionsApplicationService } from "./prescriptions.application-service";
import { PrescriptionsController } from "./prescriptions.controller";

@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsApplicationService],
})
export class PrescriptionsModule {}
