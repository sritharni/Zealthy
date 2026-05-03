"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Gender } from "@/shared";

import { FormField } from "@/components/form/form-field";
import { FormSection } from "@/components/form/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/http/api-error";

import { useCreatePatient, useUpdatePatient } from "../hooks/use-patient-mutations";
import { PatientCreateSchema, PatientUpdateSchema, type PatientCreateInput } from "../schema";
import type { PatientDetail } from "../types";
import styles from "./patient-form.module.css";

type PatientFormValues = PatientCreateInput;

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  NON_BINARY: "Non-binary",
  OTHER: "Other",
  UNDISCLOSED: "Prefer not to say",
};

const CREATE_DEFAULTS: PatientCreateInput = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  dob: "",
  gender: Gender.UNDISCLOSED,
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
};

function detailToDefaults(detail: PatientDetail): PatientFormValues {
  return {
    firstName: detail.firstName,
    lastName: detail.lastName,
    email: detail.email,
    password: "",
    phone: detail.phone,
    dob: detail.dob,
    gender: detail.gender,
    addressLine1: detail.addressLine1 ?? "",
    addressLine2: detail.addressLine2 ?? "",
    city: detail.city ?? "",
    state: detail.state ?? "",
    postalCode: detail.postalCode ?? "",
    notes: detail.notes ?? "",
  };
}

type PatientFormProps =
  | { mode: "create" }
  | { mode: "edit"; initial: PatientDetail };

export function PatientForm(props: PatientFormProps) {
  if (props.mode === "edit") {
    return <PatientEditForm initial={props.initial} />;
  }
  return <PatientCreateForm />;
}

function PatientCreateForm() {
  const router = useRouter();
  const mutation = useCreatePatient();
  const form = useForm<PatientCreateInput>({
    resolver: zodResolver(PatientCreateSchema),
    defaultValues: CREATE_DEFAULTS,
    mode: "onBlur",
  });

  return (
    <PatientFormBody
      mode="create"
      form={form}
      mutation={mutation}
      submitLabel="Create patient"
      pendingLabel="Creating..."
      onSubmit={async (values) => {
        const created = await mutation.mutateAsync(values);
        router.push(routes.admin.patients.detail(created.id));
      }}
    />
  );
}

function PatientEditForm({ initial }: { initial: PatientDetail }) {
  const router = useRouter();
  const mutation = useUpdatePatient(initial.id);
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientUpdateSchema),
    defaultValues: detailToDefaults(initial),
    mode: "onBlur",
  });

  return (
    <PatientFormBody
      mode="edit"
      form={form}
      mutation={mutation}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        router.push(routes.admin.patients.detail(initial.id));
      }}
    />
  );
}

type PatientFormBodyProps = {
  mode: "create" | "edit";
  form: UseFormReturn<PatientFormValues>;
  mutation: {
    isPending: boolean;
    error: unknown;
  };
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: PatientFormValues) => Promise<void>;
};

function PatientFormBody({
  mode,
  form,
  mutation,
  submitLabel,
  pendingLabel,
  onSubmit,
}: PatientFormBodyProps) {
  const router = useRouter();

  useEffect(() => {
    if (mutation.error instanceof ApiError && mutation.error.code === "CONFLICT") {
      form.setError("email", { message: mutation.error.message });
    }
  }, [form, mutation.error]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isSubmitting = mutation.isPending;
  const formError = mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <form onSubmit={submit} className={styles.form} noValidate>
      <FormSection
        title="Patient identity"
        description="Core demographic fields used for both the EMR and portal sign-in."
      >
        <FormField form={form} name="firstName" label="First name" required>
          <Input autoComplete="given-name" />
        </FormField>
        <FormField form={form} name="lastName" label="Last name" required>
          <Input autoComplete="family-name" />
        </FormField>
        <FormField form={form} name="email" label="Email" required className="md:col-span-2">
          <Input type="email" autoComplete="email" />
        </FormField>
        <FormField form={form} name="password" label="Portal password" required={mode === "create"}>
          <Input type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} />
        </FormField>
        <FormField form={form} name="phone" label="Phone" required>
          <Input type="tel" autoComplete="tel" placeholder="(555) 123-4567" />
        </FormField>
        <FormField form={form} name="dob" label="Date of birth" required>
          <Input type="date" max={new Date().toISOString().slice(0, 10)} />
        </FormField>
        <FormField form={form} name="gender" label="Gender">
          {({ value, onChange, hasError }) => (
            <Select
              value={typeof value === "string" ? value : Gender.UNDISCLOSED}
              onValueChange={onChange}
            >
              <SelectTrigger aria-invalid={hasError || undefined}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(GENDER_LABELS) as Gender[]).map((option) => (
                  <SelectItem key={option} value={option}>
                    {GENDER_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </FormSection>

      <FormSection title="Address" description="Contact information used for reminders and correspondence.">
        <FormField form={form} name="addressLine1" label="Address line 1" className="md:col-span-2">
          <Input autoComplete="address-line1" />
        </FormField>
        <FormField form={form} name="addressLine2" label="Address line 2" className="md:col-span-2">
          <Input autoComplete="address-line2" />
        </FormField>
        <FormField form={form} name="city" label="City">
          <Input autoComplete="address-level2" />
        </FormField>
        <FormField form={form} name="state" label="State">
          <Input maxLength={2} placeholder="CA" autoComplete="address-level1" />
        </FormField>
        <FormField form={form} name="postalCode" label="Postal code">
          <Input autoComplete="postal-code" />
        </FormField>
      </FormSection>

      <FormSection title="Clinical notes" description="Visible to staff only.">
        <FormField form={form} name="notes" label="Internal notes" className="md:col-span-2">
          <Textarea rows={4} />
        </FormField>
      </FormSection>

      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <FormFooter
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}

function FormFooter({
  onCancel,
  isSubmitting,
  submitLabel,
  pendingLabel,
}: {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  pendingLabel: string;
}): ReactNode {
  return (
    <div className={styles.footer}>
      <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}
