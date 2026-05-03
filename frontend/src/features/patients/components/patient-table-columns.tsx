import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { type DataTableColumn } from "@/components/data-table/types";
import { routes } from "@/config/routes";
import { calculateAge, formatDate } from "@/lib/format/date";
import { formatFullName } from "@/lib/format/name";
import { formatPhone } from "@/lib/format/phone";

import type { PatientSortField } from "../schema";
import type { PatientListItem } from "../types";

export const patientColumns: DataTableColumn<PatientListItem, PatientSortField>[] = [
  {
    id: "name",
    header: "Patient",
    sortField: "name",
    cell: (patient) => (
      <Link
        href={routes.admin.patients.detail(patient.id)}
        className="font-medium text-foreground hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {formatFullName(patient)}
      </Link>
    ),
    mobileLabel: "Patient",
  },
  {
    id: "email",
    header: "Email",
    cell: (patient) => <span className="text-muted-foreground">{patient.email}</span>,
    className: "max-w-[260px] truncate",
    mobileLabel: "Email",
  },
  {
    id: "dob",
    header: "DOB",
    sortField: "dob",
    cell: (patient) => (
      <span className="tabular-nums">
        {formatDate(patient.dob)}{" "}
        <span className="text-muted-foreground">({calculateAge(patient.dob)})</span>
      </span>
    ),
    mobileLabel: "Date of birth",
  },
  {
    id: "phone",
    header: "Phone",
    cell: (patient) => (
      <span className="tabular-nums text-muted-foreground">{formatPhone(patient.phone)}</span>
    ),
    mobileLabel: "Phone",
  },
  {
    id: "upcomingAppointments",
    header: "Upcoming",
    sortField: "upcomingAppointments",
    cell: (patient) => <CountBadge value={patient.upcomingAppointmentCount} />,
    className: "w-[120px]",
    mobileLabel: "Upcoming appts",
  },
  {
    id: "activeMedications",
    header: "Active meds",
    sortField: "activeMedications",
    cell: (patient) => <CountBadge value={patient.activeMedicationCount} />,
    className: "w-[120px]",
    mobileLabel: "Active meds",
  },
  {
    id: "createdAt",
    header: "Created",
    sortField: "createdAt",
    cell: (patient) => (
      <span className="tabular-nums text-muted-foreground">{formatDate(patient.createdAt)}</span>
    ),
    className: "w-[140px]",
    mobileLabel: "Created",
  },
];

function CountBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <Badge variant="secondary" className="tabular-nums">
      {value}
    </Badge>
  );
}