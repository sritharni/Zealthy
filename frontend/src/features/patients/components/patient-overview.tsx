import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";

import type { PatientDetail } from "../types";

type Props = { patient: PatientDetail };

export function PatientOverview({ patient }: Props) {
  const fullAddress = formatAddress(patient);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <DefinitionList
            items={[
              { label: "DOB", value: formatDate(patient.dob) },
              { label: "Email", value: patient.email },
              { label: "Phone", value: formatPhone(patient.phone) },
              { label: "Address", value: fullAddress ?? "—" },
              { label: "Created", value: formatDate(patient.createdAt) },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal notes</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {patient.notes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type DefinitionItem = { label: string; value: string };

function DefinitionList({ items }: { items: DefinitionItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-3 text-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[100px_1fr] gap-2">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatAddress(patient: PatientDetail): string | null {
  const lines = [
    patient.addressLine1,
    patient.addressLine2,
    [patient.city, patient.state, patient.postalCode].filter(Boolean).join(", "),
  ].filter((segment): segment is string => Boolean(segment && segment.length > 0));
  return lines.length > 0 ? lines.join("\n") : null;
}
