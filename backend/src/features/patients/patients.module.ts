import { Module } from "@nestjs/common";

import { PatientsApplicationService } from "./patients.application-service";
import { PatientsController } from "./patients.controller";

@Module({
  controllers: [PatientsController],
  providers: [PatientsApplicationService],
  exports: [PatientsApplicationService],
})
export class PatientsModule {}
