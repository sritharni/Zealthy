import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import styles from "./button.module.css";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClass: Record<ButtonVariant, string | undefined> = {
  default: styles.variant_default,
  secondary: styles.variant_secondary,
  outline: styles.variant_outline,
  ghost: styles.variant_ghost,
  destructive: styles.variant_destructive,
  link: styles.variant_link,
};

const sizeClass: Record<ButtonSize, string | undefined> = {
  sm: styles.size_sm,
  md: styles.size_md,
  lg: styles.size_lg,
  icon: styles.size_icon,
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "md", asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(styles.root, variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
});
