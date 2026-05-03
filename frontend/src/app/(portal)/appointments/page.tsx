import { apiRoutes, type PatientPortalSummary } from "@/shared";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requirePatientSession } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format/date";
import { serverApi } from "@/lib/http/server-api";

import styles from "./page.module.css";

export default async function PortalAppointmentsPage() {
  const session = await requirePatientSession();
  const patient = await serverApi.get<PatientPortalSummary>(
    apiRoutes.patients.portalSummary(session.sub),
  );

  return (
    <div className={styles.root}>
      <section className={styles.intro}>
        <h1 className={styles.title}>Appointments</h1>
        <p className={styles.subtitle}>
          Your projected schedule for the next 3 months, including recurring series.
        </p>
      </section>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base">Upcoming schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.listItem}>
              <div>
                <p className="font-medium">{appointment.providerName}</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(appointment.appointmentDate)}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.isRecurring ? `Repeats ${appointment.repeatSchedule.toLowerCase()}` : "One-time appointment"}
                  {appointment.notes ? ` · ${appointment.notes}` : ""}
                </p>
              </div>
              <Badge>{appointment.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
