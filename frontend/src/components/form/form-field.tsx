"use client";

import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import styles from "./form-field.module.css";

type Renderable<TValues extends FieldValues, TName extends FieldPath<TValues>> =
  | ReactNode
  | ((args: {
      id: string;
      name: TName;
      value: unknown;
      onChange: (...event: unknown[]) => void;
      onBlur: () => void;
      ref: (element: unknown) => void;
      hasError: boolean;
    }) => ReactNode);

type FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = {
  form: UseFormReturn<TValues>;
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  /**
   * Either a render function or a React node. If a node, the field will be
   * cloned with `name`/`id`/`onChange`/`onBlur`/`ref` props. The render-prop
   * form is preferred for clarity — used for non-trivial inputs (Select,
   * Combobox, custom components) where prop bridging gets messy.
   */
  children: Renderable<TValues, TName>;
};

export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  form,
  name,
  label,
  description,
  hint,
  required,
  className,
  children,
}: FormFieldProps<TValues, TName>) {
  const id = `field-${String(name)}`;
  const error = form.formState.errors[name];
  const message = errorMessage(error);
  const hasError = Boolean(message);

  const registration = form.register(name);

  const renderField = () => {
    if (typeof children === "function") {
      const value = form.watch(name);
      return children({
        id,
        name,
        value,
        onChange: (...args: unknown[]) => {
          const next = args[0] as TValues[TName];
          form.setValue(name, next, { shouldDirty: true, shouldValidate: hasError });
        },
        onBlur: () => {
          void form.trigger(name);
        },
        ref: () => {},
        hasError,
      });
    }

    const child = Children.only(children) as ReactElement<Record<string, unknown>>;
    if (!isValidElement(child)) return child;

    return cloneElement(child, {
      id,
      ...registration,
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${id}-error` : description ? `${id}-description` : undefined,
    });
  };

  return (
    <div className={cn(styles.root, className)}>
      <Label htmlFor={id} className={styles.label}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </Label>
      {renderField()}
      {description && !hasError ? (
        <p id={`${id}-description`} className={styles.helper}>
          {description}
        </p>
      ) : null}
      {hint && !hasError ? <p className={styles.helper}>{hint}</p> : null}
      {hasError ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const msg = (error as { message?: unknown }).message;
  return typeof msg === "string" && msg.length > 0 ? msg : undefined;
}