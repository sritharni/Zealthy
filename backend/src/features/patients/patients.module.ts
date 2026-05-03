import { Module } from "@nestjs/common";

import { AuthModule } from "@/features/auth/auth.module";
import { PortalSessionGuard } from "@/common/guards/portal-session.guard";

import { PatientsController } from "./patients.controller";

@Module({
  imports: [AuthModule],
  controllers: [PatientsController],
  providers: [PortalSessionGuard],
})
export class PatientsModule {}
