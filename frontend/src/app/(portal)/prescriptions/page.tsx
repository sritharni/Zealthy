import { apiRoutes, type PatientPortalSummary } from "@/shared";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePatientSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/format/date";
import { serverApi } from "@/lib/http/server-api";

import styles from "./page.module.css";

export default async function PortalPrescriptionsPage() {
  const session = await requirePatientSession();
  const patient = await serverApi.get<PatientPortalSummary>(
    apiRoutes.patients.portalSummary(session.sub),
  );

  return (
    <div className={styles.root}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Prescriptions</h1>
        <p className={styles.subtitle}>
          Review active medications, refill cadence, and instructions.
        </p>
      </section>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base">Medication list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.prescriptions.map((prescription) => (
            <div key={prescription.id} className={styles.listItem}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {prescription.medicationName} {prescription.dosage}
                  </p>
                  <Badge variant={prescription.isActive ? "success" : "outline"}>
                    {prescription.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quantity {prescription.quantity} · {prescription.refillSchedule.toLowerCase()} refill · next on{" "}
                  {formatDate(prescription.refillDate)}
                </p>
                {prescription.instructions ? (
                  <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base">Upcoming refills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.upcomingRefills.map((refill) => (
            <div key={refill.id} className={styles.refillItem}>
              <p className="font-medium">
                {refill.medicationName} {refill.dosage}
              </p>
              <p className="text-sm text-muted-foreground">
                Refill on {formatDate(refill.refillDate)} · quantity {refill.quantity}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
