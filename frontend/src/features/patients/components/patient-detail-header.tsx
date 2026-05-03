import Link from "next/link";
import { CalendarClock, PillBottle, Pencil } from "lucide-react";
import type { Gender } from "@/shared";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { calculateAge, formatDate } from "@/lib/format/date";
import { formatFullName, formatInitials } from "@/lib/format/name";

import type { PatientDetail } from "../types";

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  NON_BINARY: "Non-binary",
  OTHER: "Other",
  UNDISCLOSED: "Unspecified",
};

type Props = { patient: PatientDetail };

export function PatientDetailHeader({ patient }: Props) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 rounded-3xl border bg-card/90 p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary"
          >
            {formatInitials(patient)}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{formatFullName(patient)}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="tabular-nums">
                {calculateAge(patient.dob)} y/o · DOB {formatDate(patient.dob)}
              </span>
              <Badge variant="outline">{GENDER_LABELS[patient.gender]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Portal login: {patient.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={routes.admin.patients.edit(patient.id)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit patient
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickStatCard
          label="Upcoming appointments"
          value={String(patient.stats.upcomingAppointmentCount)}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <QuickStatCard
          label="Active prescriptions"
          value={String(patient.stats.activePrescriptionCount)}
          icon={<PillBottle className="h-4 w-4" />}
        />
        <QuickStatCard
          label="Upcoming refills"
          value={String(patient.stats.upcomingRefillCount)}
          icon={<PillBottle className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

function QuickStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
