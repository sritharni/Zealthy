import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import styles from "./badge.module.css";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variantClass: Record<BadgeVariant, string | undefined> = {
  default: styles.variant_default,
  secondary: styles.variant_secondary,
  outline: styles.variant_outline,
  success: styles.variant_success,
  warning: styles.variant_warning,
  destructive: styles.variant_destructive,
};

export type BadgeProps = HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <div className={cn(styles.root, variantClass[variant], className)} {...props} />;
}
