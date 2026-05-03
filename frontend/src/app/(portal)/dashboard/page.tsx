import { CalendarClock, PillBottle } from "lucide-react";
import { apiRoutes, type PatientPortalSummary } from "@/shared";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePatientSession } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { serverApi } from "@/lib/http/server-api";

import styles from "./page.module.css";

export default async function PortalDashboardPage() {
  const session = await requirePatientSession();
  const patient = await serverApi.get<PatientPortalSummary>(
    apiRoutes.patients.portalSummary(session.sub),
  );

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Patient dashboard</p>
        <h1 className={styles.title}>
          Welcome back, {patient.firstName}
        </h1>
        <p className={styles.subtitle}>
          Here is a concise view of your next 7 days of care, upcoming medication activity,
          and profile details.
        </p>
      </section>

      <div className={styles.summaryGrid}>
        <SummaryCard icon={<CalendarClock className="h-5 w-5" />} label="Appointments in 7 days" value={String(patient.stats.appointmentCount7d)} />
        <SummaryCard icon={<PillBottle className="h-5 w-5" />} label="Refills in 7 days" value={String(patient.stats.refillCount7d)} />
        <SummaryCard icon={<PillBottle className="h-5 w-5" />} label="Active prescriptions" value={String(patient.stats.activePrescriptionCount)} />
      </div>

      <div className={styles.twoColumnGrid}>
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Definition label="Email" value={patient.email} />
            <Definition label="Phone" value={formatPhone(patient.phone)} />
            <Definition label="DOB" value={formatDate(patient.dob)} />
            <Definition label="Gender" value={patient.gender.replaceAll("_", " ")} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Upcoming appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.upcomingAppointments.length > 0 ? (
              patient.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border p-4">
                  <p className="font-medium">{appointment.providerName}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(appointment.appointmentDate)}</p>
                </div>
              ))
            ) : (
              <EmptyCopy icon={<CalendarClock className="h-4 w-4" />} text="No appointments in the next 7 days." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base">Upcoming refills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.upcomingRefills.length > 0 ? (
            patient.upcomingRefills.map((refill) => (
              <div key={refill.id} className="rounded-2xl border p-4">
                <p className="font-medium">
                  {refill.medicationName} {refill.dosage}
                </p>
                <p className="text-sm text-muted-foreground">
                  Refill by {formatDate(refill.refillDate)} · quantity {refill.quantity}
                </p>
              </div>
            ))
          ) : (
            <EmptyCopy icon={<PillBottle className="h-4 w-4" />} text="No refills due in the next 7 days." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className={styles.summaryCard}>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={styles.summaryIcon}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.definition}>
      <p className="text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function EmptyCopy({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className={styles.emptyCopy}>
      <div className={styles.emptyIcon}>{icon}</div>
      {text}
    </div>
  );
}
