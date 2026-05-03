"use client";

import { AppointmentStatus, RepeatSchedule } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format/date";

import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "../hooks/use-appointments";
import {
  AppointmentUpsertSchema,
  type AppointmentUpsertInput,
} from "../schema";
import type { AppointmentRecord } from "../types";
import type { PatientDetail } from "@/features/patients/types";
import styles from "./appointment-manager.module.css";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

const STATUS_VARIANTS: Record<AppointmentStatus, "default" | "success" | "warning" | "destructive"> = {
  SCHEDULED: "default",
  CONFIRMED: "success",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "warning",
};

const REPEAT_LABELS: Record<RepeatSchedule, string> = {
  NONE: "Does not repeat",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

type Props = { patient: PatientDetail };

export function AppointmentManager({ patient }: Props) {
  const appointmentsQuery = useAppointments({ patientId: patient.id });
  const createMutation = useCreateAppointment(patient.id);
  const deleteMutation = useDeleteAppointment(patient.id);
  const appointments = appointmentsQuery.data ?? patient.appointments;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Appointment plans</h2>
          <p className="text-sm text-muted-foreground">
            Recurring schedules generate projected visits up to 3 months out.
          </p>
        </div>
        <AppointmentDialog
          patientId={patient.id}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New appointment
            </Button>
          }
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
            toast.success("Appointment created");
          }}
        />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Upcoming schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.upcomingAppointments.length > 0 ? (
            patient.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className={styles.upcomingItem}>
                <div>
                  <p className="font-medium">{appointment.providerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(appointment.appointmentDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {REPEAT_LABELS[appointment.repeatSchedule]}
                    {appointment.notes ? ` · ${appointment.notes}` : ""}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANTS[appointment.status]}>{STATUS_LABELS[appointment.status]}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments in the next 3 months.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Series management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className={styles.seriesItem}>
              <div className={styles.seriesMeta}>
                <div className={styles.seriesHeading}>
                  <p className="font-medium">{appointment.providerName}</p>
                  <Badge variant={STATUS_VARIANTS[appointment.status]}>{STATUS_LABELS[appointment.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Starts {formatDateTime(appointment.appointmentDate)} · {REPEAT_LABELS[appointment.repeatSchedule]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.repeatEndDate
                    ? `Ends ${formatDate(appointment.repeatEndDate)}`
                    : appointment.repeatSchedule === RepeatSchedule.NONE
                      ? "One-time visit"
                      : "Open-ended recurrence"}
                </p>
                {appointment.notes ? <p className="text-sm text-muted-foreground">{appointment.notes}</p> : null}
              </div>

              <div className={styles.actions}>
                <AppointmentEditorButton
                  patientId={patient.id}
                  appointment={appointment}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await deleteMutation.mutateAsync(appointment.id);
                    toast.success("Appointment deleted");
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

function AppointmentEditorButton({
  patientId,
  appointment,
}: {
  patientId: string;
  appointment: AppointmentRecord;
}) {
  const updateMutation = useUpdateAppointment(patientId, appointment.id);
  return (
    <AppointmentDialog
      patientId={patientId}
      initial={appointment}
      trigger={
        <Button variant="outline" size="sm">
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      }
      onSubmit={async (values) => {
        await updateMutation.mutateAsync(values);
        toast.success("Appointment updated");
      }}
    />
  );
}

function AppointmentDialog({
  patientId,
  initial,
  trigger,
  onSubmit,
}: {
  patientId: string;
  initial?: AppointmentRecord;
  trigger: ReactNode;
  onSubmit: (values: AppointmentUpsertInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<AppointmentUpsertInput>({
    resolver: zodResolver(AppointmentUpsertSchema),
    defaultValues: {
      patientId,
      providerName: initial?.providerName ?? "",
      appointmentDate: initial?.appointmentDate?.slice(0, 16) ?? "",
      repeatSchedule: initial?.repeatSchedule ?? RepeatSchedule.NONE,
      repeatEndDate: initial?.repeatEndDate?.slice(0, 10) ?? "",
      notes: initial?.notes ?? "",
      status: initial?.status ?? AppointmentStatus.SCHEDULED,
    },
  });

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit appointment" : "Create appointment"}</DialogTitle>
          <DialogDescription>
            Configure the anchor visit and recurrence rule. Future visits are generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormField form={form} name="providerName" label="Provider" required>
            <Input />
          </FormField>
          <FormField form={form} name="appointmentDate" label="Appointment date" required>
            <Input type="datetime-local" />
          </FormField>
          <FormField form={form} name="repeatSchedule" label="Repeat schedule">
            {({ value, onChange, hasError }) => (
              <Select value={String(value)} onValueChange={onChange}>
                <SelectTrigger aria-invalid={hasError || undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPEAT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField form={form} name="repeatEndDate" label="Repeat end date">
            <Input type="date" />
          </FormField>
          <FormField form={form} name="status" label="Status">
            {({ value, onChange, hasError }) => (
              <Select value={String(value)} onValueChange={onChange}>
                <SelectTrigger aria-invalid={hasError || undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField form={form} name="notes" label="Notes" className="md:col-span-2">
            <Textarea rows={4} />
          </FormField>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Save changes" : "Create appointment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
