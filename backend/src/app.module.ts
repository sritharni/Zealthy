import { Module } from "@nestjs/common";

import { AppointmentsModule } from "@/features/appointments/appointments.module";
import { AuthModule } from "@/features/auth/auth.module";
import { MedicationCatalogModule } from "@/features/medication-catalog/medication-catalog.module";
import { PatientsModule } from "@/features/patients/patients.module";
import { PrescriptionsModule } from "@/features/prescriptions/prescriptions.module";

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    PrescriptionsModule,
    MedicationCatalogModule,
  ],
})
export class AppModule {}
