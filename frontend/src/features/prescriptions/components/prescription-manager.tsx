"use client";

import { RefillSchedule } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/form/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format/date";

import {
  useCreatePrescription,
  useDeletePrescription,
  useMedicationCatalog,
  usePrescriptions,
  useUpdatePrescription,
} from "../hooks/use-prescriptions";
import {
  PrescriptionUpsertSchema,
  type PrescriptionUpsertInput,
} from "../schema";
import type { PrescriptionRecord } from "../types";
import type { PatientDetail } from "@/features/patients/types";
import styles from "./prescription-manager.module.css";

const REFILL_LABELS: Record<RefillSchedule, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

type Props = { patient: PatientDetail };

export function PrescriptionManager({ patient }: Props) {
  const prescriptionsQuery = usePrescriptions({ patientId: patient.id });
  const medicationCatalogQuery = useMedicationCatalog();
  const createMutation = useCreatePrescription(patient.id);
  const deleteMutation = useDeletePrescription(patient.id);
  const prescriptions = prescriptionsQuery.data ?? patient.prescriptions;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Prescription management</h2>
          <p className="text-sm text-muted-foreground">
            Uses catalog-backed medication names and projects recurring refills.
          </p>
        </div>
        <PrescriptionDialog
          patientId={patient.id}
          catalog={medicationCatalogQuery.data ?? []}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New prescription
            </Button>
          }
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
            toast.success("Prescription created");
          }}
        />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Upcoming refills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.upcomingRefills.length > 0 ? (
            patient.upcomingRefills.map((refill) => (
              <div key={refill.id} className={styles.upcomingItem}>
                <div>
                  <p className="font-medium">
                    {refill.medicationName} {refill.dosage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Refill on {formatDate(refill.refillDate)} · {REFILL_LABELS[refill.refillSchedule]}
                  </p>
                  {refill.instructions ? (
                    <p className="text-sm text-muted-foreground">{refill.instructions}</p>
                  ) : null}
                </div>
                <Badge variant={refill.isActive ? "success" : "outline"}>
                  {refill.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming refills in the next 3 months.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Prescription list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className={styles.listItem}>
              <div className={styles.listMeta}>
                <div className={styles.listHeading}>
                  <p className="font-medium">
                    {prescription.medicationName} {prescription.dosage}
                  </p>
                  <Badge variant={prescription.isActive ? "success" : "outline"}>
                    {prescription.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Qty {prescription.quantity} · Next refill {formatDate(prescription.refillDate)} ·{" "}
                  {REFILL_LABELS[prescription.refillSchedule]}
                </p>
                {prescription.instructions ? (
                  <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <PrescriptionEditorButton
                  patientId={patient.id}
                  prescription={prescription}
                  catalog={medicationCatalogQuery.data ?? []}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await deleteMutation.mutateAsync(prescription.id);
                    toast.success("Prescription deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PrescriptionEditorButton({
  patientId,
  prescription,
  catalog,
}: {
  patientId: string;
  prescription: PrescriptionRecord;
  catalog: Array<{ id: string; medicationName: string; dosage: string }>;
}) {
  const updateMutation = useUpdatePrescription(patientId, prescription.id);
  return (
    <PrescriptionDialog
      patientId={patientId}
      initial={prescription}
      catalog={catalog}
      trigger={
        <Button variant="outline" size="sm">
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      }
      onSubmit={async (values) => {
        await updateMutation.mutateAsync(values);
        toast.success("Prescription updated");
      }}
    />
  );
}

function PrescriptionDialog({
  patientId,
  initial,
  catalog,
  trigger,
  onSubmit,
}: {
  patientId: string;
  initial?: PrescriptionRecord;
  catalog: Array<{ id: string; medicationName: string; dosage: string }>;
  trigger: React.ReactNode;
  onSubmit: (values: PrescriptionUpsertInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<PrescriptionUpsertInput>({
    resolver: zodResolver(PrescriptionUpsertSchema),
    defaultValues: useMemo(
      () => ({
        patientId,
        medicationCatalogId: initial?.medicationCatalogId ?? "",
        medicationName: initial?.medicationName ?? "",
        dosage: initial?.dosage ?? "",
        quantity: initial?.quantity ?? 1,
        refillDate: initial?.refillDate ?? "",
        refillSchedule: initial?.refillSchedule ?? RefillSchedule.MONTHLY,
        instructions: initial?.instructions ?? "",
        isActive: initial?.isActive ?? true,
      }),
      [initial, patientId],
    ),
  });

  const selectedCatalogId = form.watch("medicationCatalogId");
  useEffect(() => {
    if (!selectedCatalogId) return;
    const selected = catalog.find((item) => item.id === selectedCatalogId);
    if (!selected) return;
    form.setValue("medicationName", selected.medicationName);
    form.setValue("dosage", selected.dosage);
  }, [catalog, form, selectedCatalogId]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit prescription" : "Create prescription"}</DialogTitle>
          <DialogDescription>
            Catalog selections prefill medication and dosage while still allowing manual edits.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormField form={form} name="medicationCatalogId" label="Catalog medication">
            {({ value, onChange, hasError }) => (
              <Select value={String(value || "")} onValueChange={onChange}>
                <SelectTrigger aria-invalid={hasError || undefined}>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.medicationName} {item.dosage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField form={form} name="medicationName" label="Medication name" required>
            <Input />
          </FormField>
          <FormField form={form} name="dosage" label="Dosage" required>
            <Input />
          </FormField>
          <FormField form={form} name="quantity" label="Quantity" required>
            <Input type="number" min={1} />
          </FormField>
          <FormField form={form} name="refillDate" label="Refill date" required>
            <Input type="date" />
          </FormField>
          <FormField form={form} name="refillSchedule" label="Refill schedule">
            {({ value, onChange, hasError }) => (
              <Select value={String(value)} onValueChange={onChange}>
                <SelectTrigger aria-invalid={hasError || undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REFILL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField form={form} name="isActive" label="Status">
            {({ value, onChange, hasError }) => (
              <Select value={String(value)} onValueChange={(next) => onChange(next === "true")}>
                <SelectTrigger aria-invalid={hasError || undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField form={form} name="instructions" label="Instructions" className="md:col-span-2">
            <Textarea rows={4} />
          </FormField>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Save changes" : "Create prescription"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
