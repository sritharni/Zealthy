import { Module } from "@nestjs/common";

import { AppointmentsApplicationService } from "./appointments.application-service";
import { AppointmentsController } from "./appointments.controller";

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsApplicationService],
})
export class AppointmentsModule {}
