import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import styles from "./spinner.module.css";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span className={styles.root} role="status">
      <Loader2 className={cn(styles.icon, className)} aria-hidden />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
