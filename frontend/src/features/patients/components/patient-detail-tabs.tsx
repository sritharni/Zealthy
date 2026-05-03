"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentManager } from "@/features/appointments/components/appointment-manager";
import { PrescriptionManager } from "@/features/prescriptions/components/prescription-manager";

import type { PatientDetail } from "../types";
import { PatientOverview } from "./patient-overview";
import styles from "./patient-detail-tabs.module.css";

type Props = { patient: PatientDetail };

export function PatientDetailTabs({ patient }: Props) {
  return (
    <Tabs defaultValue="overview" className={styles.root}>
      <TabsList
        aria-label="Patient detail sections"
        className={styles.list}
      >
        <TabsTrigger value="overview" className={styles.trigger}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="appointments" className={styles.trigger}>
          Appointments ({patient.stats.upcomingAppointmentCount})
        </TabsTrigger>
        <TabsTrigger value="prescriptions" className={styles.trigger}>
          Prescriptions ({patient.stats.activePrescriptionCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className={styles.content}>
        <PatientOverview patient={patient} />
      </TabsContent>
      <TabsContent value="appointments" className={styles.content}>
        <AppointmentManager patient={patient} />
      </TabsContent>
      <TabsContent value="prescriptions" className={styles.content}>
        <PrescriptionManager patient={patient} />
      </TabsContent>
    </Tabs>
  );
}
